import React, { useState } from 'react';

const GuessingGame = () => {
  const [targetNumber, setTargetNumber] = useState(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Guess a number between 1 and 100!');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleGuess = (e) => {
    e.preventDefault();
    const userGuess = parseInt(guess);
    
    if (isNaN(userGuess)) {
      setMessage('Please enter a valid number!');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (userGuess === targetNumber) {
      setMessage(`🎉 Correct! You guessed it in ${newAttempts} attempts!`);
      setGameOver(true);
    } else if (userGuess < targetNumber) {
      setMessage('📉 Too low! Try a higher number.');
    } else {
      setMessage('📈 Too high! Try a lower number.');
    }
    setGuess('');
  };

  const resetGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setMessage('Guess a number between 1 and 100!');
    setAttempts(0);
    setGameOver(false);
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🎯 Number Guessing Challenge</h3>
      <p style={styles.message}>{message}</p>
      
      {!gameOver ? (
        <form onSubmit={handleGuess} style={styles.form}>
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess"
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Guess</button>
        </form>
      ) : (
        <button onClick={resetGame} style={styles.resetButton}>Play Again</button>
      )}
      <p style={styles.attempts}>Attempts: {attempts}</p>
    </div>
  );
};

// Quick glass-morphic styles to match your dashboard dashboard theme
const styles = {
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    margin: '20px auto',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
  },
  title: { margin: '0 0 12px 0', fontSize: '1.4rem', color: '#61dafb' },
  message: { fontSize: '1rem', marginBottom: '16px' },
  form: { display: 'flex', gap: '10px', justifyContent: 'center' },
  input: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    width: '120px',
    textAlign: 'center',
    fontSize: '1rem'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#61dafb',
    color: '#20232a',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  resetButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#4caf50',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  attempts: { fontSize: '0.85rem', color: '#aaa', marginTop: '12px', margin_bottom: 0 }
};

export default GuessingGame;