package api

import (
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/anomalous"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/historical"
	"github.com/edinnen/Thanksgiving_Intranet/analyzer/api/users"
	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	"github.com/rs/cors"
	log "github.com/sirupsen/logrus"
)

// spaHandler implements the http.Handler interface, so we can use it
// to respond to HTTP requests. The path to the static directory and
// path to the index file within that static directory are used to
// serve the SPA in the given static directory.
type spaHandler struct {
	staticPath string
	indexPath  string
}

// ServeHTTP inspects the URL path to locate a file within the static dir
// on the SPA handler. If a file is found, it will be served. If not, the
// file located at the index path on the SPA handler will be served. This
// is suitable behavior for serving an SPA (single page application).
func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// get the absolute path to prevent directory traversal
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		// if we failed to get the absolute path respond with a 400 bad request
		// and stop
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// prepend the path with the path to the static directory
	path = filepath.Join(h.staticPath, path)

	// check whether a file exists at the given path
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		// file does not exist, serve index.html
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 500 internal server error and stop
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// otherwise, use http.FileServer to serve the static dir
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}

// Start our API attached to the given database
func Start(db *sqlx.DB, mutex *sync.Mutex) {
	// Setup our router
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		// Enable Debugging for testing, consider disabling in production
		// Debug: true,
	})

	main := mux.NewRouter()

	apiSubrouterPath := "/api"
	routerAPI := main.PathPrefix(apiSubrouterPath).Subrouter()

	// Load our endpoints
	users.Load(routerAPI, db, mutex)
	historical.Load(routerAPI, db, mutex)
	anomalous.Load(routerAPI, db, mutex)

	// Serve react app. Handle / after any subroutes to avoid catching all routes
	react := spaHandler{staticPath: "/var/www", indexPath: "index.html"}
	main.PathPrefix("/").Handler(react)

	server := &http.Server{Handler: c.Handler(main)}

	log.Info("API started on port :80")

	// Prevents memory leak
	server.SetKeepAlivesEnabled(false)
	server.ListenAndServe()
}
