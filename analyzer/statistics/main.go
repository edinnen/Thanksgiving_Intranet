package statistics

import (
	"math/big"
	"sync"
	"time"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/models"
	"github.com/sirupsen/logrus"
	"gopkg.in/oleiade/reflections.v1"

	"github.com/jmoiron/sqlx"

	"github.com/sec51/goanomaly"
)

// Engine holds necessary values for our statistics engine
type Engine struct {
	db        *sqlx.DB
	mutex     *sync.Mutex
	readings  []models.CabinReading
	timeRange TimeRange
}

// TimeRange defines a to/from range for our queries
type TimeRange struct {
	From time.Time
	To   time.Time
}

// NewClient creates a new statistics engine
func NewClient(db *sqlx.DB, mutex *sync.Mutex) Engine {
	return Engine{
		db:    db,
		mutex: mutex,
	}
}

// SetReadingsData searches for readings within the engine's currently defined range
func (stats *Engine) SetReadingsData() error {
	var readings []models.CabinReading
	from := stats.timeRange.From.Unix()
	to := stats.timeRange.To.Unix()
	statement := `SELECT * FROM readings WHERE unix >= ? AND unix <= ?;`
	stats.mutex.Lock()
	err := stats.db.Select(&readings, statement, from, to)
	stats.mutex.Unlock()
	stats.readings = readings
	logrus.Infof("Found %d readings in range", len(readings))
	return err
}

// DetectStreamAnomalies checks for anomalous data over a three minute time range into the past
func (stats *Engine) DetectStreamAnomalies() {
	logrus.Info("Monitoring data stream for anomalies")
	for now := range time.Tick(3 * time.Minute) {
		from := now.Add(time.Duration(-3) * time.Minute)
		stats.timeRange = TimeRange{
			To:   now,
			From: from,
		}
		logrus.Infof("Searching for battery voltages between %s and %s", from.String(), now.String())
		stats.SetReadingsData()
		if len(stats.readings) <= 0 {
			continue
		}
		bvAnomalies := batteryVoltageAnomalies(stats.readings, stats.timeRange)
		svAnomalies := solarVoltageAnomalies(stats.readings, stats.timeRange)
		baAnomalies := batteryAmperageAnomalies(stats.readings, stats.timeRange)
		saAnomalies := solarAmperageAnomalies(stats.readings, stats.timeRange)
		laAnomalies := loadAmperageAnomalies(stats.readings, stats.timeRange)
		btAnomalies := batteryTempAnomalies(stats.readings, stats.timeRange)
		bvAnomalies.SendToDB(stats.db, stats.mutex)
		svAnomalies.SendToDB(stats.db, stats.mutex)
		baAnomalies.SendToDB(stats.db, stats.mutex)
		saAnomalies.SendToDB(stats.db, stats.mutex)
		laAnomalies.SendToDB(stats.db, stats.mutex)
		btAnomalies.SendToDB(stats.db, stats.mutex)
	}
}

// computeAnomalous detects any data anomalies for a particular field in a CabinReading
// between the given TimeRange. Anomalous data is computed as `p(x) < k` via the
// Gaussian normal distribution formaula where k is 0.001.
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
			logrus.Error(err)
			return models.Anomalies{}
		}

		event := *big.NewFloat(value.(float64))
		if event == *big.NewFloat(0) {
			continue
		}

		anomaly, _ := anomalyDetector.EventIsAnomalous(event, big.NewFloat(0.001))
		if anomaly {
			anomalous = append(anomalous, reading)
			logrus.Infof("Found anomalous value %v for %s", value, field)
		}
	}
	return models.Anomalies{
		Name:     field,
		Readings: anomalous,
	}
}

func appendIfNotZero(values []big.Float, new float64) []big.Float {
	if new == 0 {
		return values
	}

	res := append(values, *big.NewFloat(new))
	return res
}

func batteryVoltageAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = appendIfNotZero(values, reading.BatteryVoltage)
	}

	anomalies = computeAnomalous("BatteryVoltage", readings, values, tsRange)
	return
}

func solarVoltageAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = appendIfNotZero(values, reading.SolarVoltage)
	}

	anomalies = computeAnomalous("SolarVoltage", readings, values, tsRange)
	return
}

func batteryAmperageAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = appendIfNotZero(values, reading.BatteryAmperage)
	}

	anomalies = computeAnomalous("BatteryAmperage", readings, values, tsRange)
	return
}

func solarAmperageAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = appendIfNotZero(values, reading.SolarAmperage)
	}

	anomalies = computeAnomalous("SolarAmperage", readings, values, tsRange)
	return
}

func loadAmperageAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = appendIfNotZero(values, reading.LoadAmperage)
	}

	anomalies = computeAnomalous("LoadAmperage", readings, values, tsRange)
	return
}

func batteryTempAnomalies(readings []models.CabinReading, tsRange TimeRange) (anomalies models.Anomalies) {
	var values []big.Float
	for _, reading := range readings {
		values = appendIfNotZero(values, reading.BatteryTemp)
	}

	anomalies = computeAnomalous("BatteryTemp", readings, values, tsRange)
	return
}
