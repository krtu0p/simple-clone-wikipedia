import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [articleContent, setArticleContent] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);


  // Function to handle the search operation
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchAttempted(true);
    console.log('Searching for:', searchTerm);
  
    try {
      const response = await axios.get(`http://localhost:8000/search?q=${searchTerm}`);
      console.log('Full response:', response);
  
      // Adjust this line to access the new structure
      if (response.data && response.data.query && response.data.query.search) {
        setResults(response.data.query.search);
      } else {
        console.error('Unexpected response data structure:', response.data);
        setResults([]);
        setArticleContent('');
        alert('Unexpected response data structure. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
      setArticleContent('');
      alert('An error occurred while fetching search results. Please try again later.');
    }
  };
  
  // Function to handle clicking on a search result
  const handleResultClick = async (pageId) => {
    try {
      const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&pageid=${pageId}&format=json&origin=*`);
      console.log('Article content response:', response);
      setArticleContent(response.data.parse.text['*']);
    } catch (error) {
      console.error('Error fetching article content:', error);
      alert('An error occurred while fetching the article content. Please try again later.');
    }
  };

  // Render the search results
  const renderResults = () => {
    if (searchAttempted && results.length > 0) {
      return results.map((result) => (
        <div key={result.pageid} onClick={() => handleResultClick(result.pageid)} className="result-item">
          <h3>{result.title}</h3>
          <p dangerouslySetInnerHTML={{ __html: result.snippet }} />
        </div>
      ));
    } else if (searchAttempted) {
      return <p>No results found.</p>;
    } else {
      return <p>Please enter a search term to get started.</p>;
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
        {renderResults()}
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
