import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [articleContent, setArticleContent] = useState('');
    const [searchAttempted, setSearchAttempted] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchAttempted(true);
        console.log('Searching for:', searchTerm);
        try {
            const response = await axios.get(`http://localhost:8000/search?q=${searchTerm}`);
            console.log('Response data:', response.data);
            setResults(response.data.results); // Make sure your backend sends an array
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    const handleResultClick = async (pageId) => {
        try {
            const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&pageid=${pageId}&format=json&origin=*`);
            setArticleContent(response.data.parse.text['*']);
        } catch (error) {
            console.error('Error fetching article content:', error);
        }
    };

    return (
        <div className="App">
            <h1>Wikipedia Search Engine</h1>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Wikipedia"
                />
                <button type="submit">Search</button>
            </form>

            <div className="results-container">
                {searchAttempted && results.length > 0 ? (
                    results.map((result) => (
                        <div key={result.pageid} onClick={() => handleResultClick(result.pageid)} className="result-item">
                            <h3>{result.title}</h3>
                            <p>{result.snippet}</p>
                        </div>
                    ))
                ) : (
                    searchAttempted && <p>No results found.</p>
                )}
            </div>

            {articleContent && (
                <div className="article-container">
                    <h2 className="article-title">Article Details</h2>
                    <div className="article-content" dangerouslySetInnerHTML={{ __html: articleContent }} />
                </div>
            )}
        </div>
    );
}

export default App;
