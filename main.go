package main

import (
    "encoding/json"
    "net/http"
    "log"

    "github.com/gorilla/mux"
    "github.com/rs/cors"
)

type SearchResult struct {
    PageID  int    `json:"pageid"`
    Title   string `json:"title"`
    Snippet string `json:"snippet"`
}

type Response struct {
    Results []SearchResult `json:"results"`
}

func searchWikipediaHandler(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query().Get("q")
    if query == "" {
        http.Error(w, "Query is required", http.StatusBadRequest)
        return
    }

    url := "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + query + "&format=json&origin=*"
    resp, err := http.Get(url)
    if err != nil {
        http.Error(w, "Failed to fetch from Wikipedia API", http.StatusInternalServerError)
        return
    }
    defer resp.Body.Close()

    var data map[string]interface{}
    if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
        http.Error(w, "Failed to decode response", http.StatusInternalServerError)
        return
    }

    searchResults := data["query"].(map[string]interface{})["search"].([]interface{})
    var results []SearchResult
    for _, item := range searchResults {
        page := item.(map[string]interface{})
        results = append(results, SearchResult{
            PageID:  int(page["pageid"].(float64)),
            Title:   page["title"].(string),
            Snippet: page["snippet"].(string),
        })
    }

    response := Response{Results: results}
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/search", searchWikipediaHandler).Methods("GET")

    // Set up CORS
    handler := cors.Default().Handler(r)

    log.Println("Server is running on http://localhost:8000")
    if err := http.ListenAndServe(":8000", handler); err != nil {
        log.Fatal(err)
    }
}
