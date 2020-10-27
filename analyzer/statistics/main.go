package statistics

import (
	"math/big"
	"sync"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
	log "github.com/sirupsen/logrus"
	"gopkg.in/oleiade/reflections.v1"

	"github.com/jmoiron/sqlx"

	"github.com/sec51/goanomaly"
)

type Engine struct {
	db        *sqlx.DB
	mutex     *sync.Mutex
	readings  []models.CabinReading
	timeRange TimeRange
}

type TimeRange struct {
	From time.Time
	To   time.Time
}

func NewClient(db *sqlx.DB, mutex *sync.Mutex) Engine {
	return Engine{
		db:    db,
		mutex: mutex,
	}
}

func (stats *Engine) SetReadingsData() error {
	var readings []models.CabinReading
	from := stats.timeRange.From.Unix()
	to := stats.timeRange.To.Unix()
	statement := `SELECT * FROM readings WHERE unix >= ? AND unix <= ?;`
	stats.mutex.Lock()
	err := stats.db.Select(&readings, statement, from, to)
	stats.mutex.Unlock()
	stats.readings = readings
	log.Infof("Found %d readings in range", len(readings))
	return err
}

func (stats *Engine) DetectStreamAnomalies() {
	log.Info("Monitoring data stream for anomalies")
	for now := range time.Tick(3 * time.Minute) {
		from := now.Add(time.Duration(-3) * time.Minute)
		stats.timeRange = TimeRange{
			To:   now,
			From: from,
		}
		log.Infof("Searching for battery voltages between %s and %s", from.String(), now.String())
		stats.SetReadingsData()
		if len(stats.readings) <= 0 {
			continue
		}
		bvAnomalies := batteryVoltageAnomalies(stats.readings, stats.timeRange)
		svAnomalies := solarVoltageAnomalies(stats.readings, stats.timeRange)
		baAnomalies := batteryAmperageAnomalies(stats.readings, stats.timeRange)
		laAnomalies := loadAmperageAnomalies(stats.readings, stats.timeRange)
		btAnomalies := batteryTempAnomalies(stats.readings, stats.timeRange)
		spew.Dump(bvAnomalies)
		spew.Dump(svAnomalies)
		spew.Dump(baAnomalies)
		spew.Dump(laAnomalies)
		spew.Dump(btAnomalies)
		bvAnomalies.SendToDB(stats.db, stats.mutex)
		svAnomalies.SendToDB(stats.db, stats.mutex)
		baAnomalies.SendToDB(stats.db, stats.mutex)
		laAnomalies.SendToDB(stats.db, stats.mutex)
		btAnomalies.SendToDB(stats.db, stats.mutex)
	}
}

func computeAnomalous(field string, readings []models.CabinReading, values []big.Float, tsRange TimeRange) (anomalies models.Anomalies) {
	anomalyDetector := goanomaly.NewAnomalyDetection(values...)

	var anomalous []models.CabinReading
	for _, reading := range readings {
		if reading.Timestamp.Before(tsRange.From) {
			continue
		}
		if reading.Timestamp.After(tsRange.To) {
			return
		}

		value, err := reflections.GetField(reading, field)
		if err != nil {
			log.Error(err)
			return models.Anomalies{}
		}

		anomaly, _ := anomalyDetector.EventIsAnomalous(*big.NewFloat(value.(float64)), big.NewFloat(0.01))
		if anomaly {
			anomalous = append(anomalous, reading)
			log.Info("Found anomalous value", value, "for", field)
		}
	}
	return models.Anomalies{
		Name:     field,
		Readings: anomalous,
	}
}

func batteryVoltageAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = append(values, *big.NewFloat(reading.BatteryVoltage))
	}

	anomalies = computeAnomalous("BatteryVoltage", readings, values, tsRange)
	return
}

func solarVoltageAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = append(values, *big.NewFloat(reading.SolarVoltage))
	}

	anomalies = computeAnomalous("SolarVoltage", readings, values, tsRange)
	return
}

func batteryAmperageAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = append(values, *big.NewFloat(reading.BatteryAmperage))
	}

	anomalies = computeAnomalous("BatteryAmperage", readings, values, tsRange)
	return
}

func loadAmperageAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = append(values, *big.NewFloat(reading.LoadAmperage))
	}

	anomalies = computeAnomalous("LoadAmperage", readings, values, tsRange)
	return
}

func batteryTempAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = append(values, *big.NewFloat(reading.BatteryTemp))
	}

	anomalies = computeAnomalous("BatteryTemp", readings, values, tsRange)
	return
}
