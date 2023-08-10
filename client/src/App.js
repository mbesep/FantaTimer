import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import styles from './App.css'; 

const App = () => {
  const [users, setUsers] = useState([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [timer, setTimer] = useState(0);
  const [startButtonDisabled, setStartButtonDisabled] = useState(false);

  const socket = io("http://localhost:3000");

  useEffect(() => {
  
    socket.on("users", (_users) => {
      setUsers(_users);
    });

    socket.on("updateTimer", (newTimer) => {
      setTimer(newTimer);
    });  

    return () => {
      socket.off("users");
      socket.off("updateTimer");
    };
  }, []);

  useEffect(() => {
    // Crea un intervallo per il decremento del timer
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer((prevTimer) => prevTimer - 1);
      }else {
        setStartButtonDisabled(false); // Riabilita il pulsante quando il timer è scaduto
        clearInterval(interval); // Ferma l'intervallo
      }
    }, 1000);

    // Pulisci l'intervallo quando il componente si dismonta
    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const addUserAndCloseModal = () => {
    if (!usernameInput) {
      return alert("Devi aggiungere il tuo nome");
    }
    socket.emit("adduser", usernameInput);
    setShowModal(false);
    setUsernameInput("");
    const backdrop = document.querySelector(".backdrop");
  backdrop.classList.add("disappear");
  };

  const startTimer = () => {
    if (!startButtonDisabled) { // Verifica se il pulsante è abilitato
      socket.emit("startTimer");
      setStartButtonDisabled(true); // Disabilita il pulsante dopo il primo clic
    }
  };

  const resetTimer = () => {
    socket.emit("resetTimer");
  };


  return (
    <div className="App">
      <div class="backdrop">

</div>
      
      {showModal && (
        <form className="modal">
          <h1 id="title">Benvenuto nel FantaTimerBuzz</h1>
          <br></br>
          <p id="content">INSERISCI IL TUO FANTANOME</p>
          <br></br>
          <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)}/>
          <button onClick={addUserAndCloseModal}>Entra</button>
        </form>
      )}

<div className="user-list">
        <h2>UTENTI CONNESSI:</h2>
        <ul id="users">
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
      
      <div className="timer-container">
        <p>Timer: {timer} Secondi</p>
        
      </div>
      <br></br>
      <button  onClick={startTimer} disabled={startButtonDisabled} class="pushable">
          <span class="shadow"></span>
          <span class="edgedue"></span>
          <span class="frontdue" >
            Avvia Asta
          </span>
      </button>

        <div>
          <br></br>
          <br></br>
        <button onClick={resetTimer} class="pushable">
                  <span class="shadow"></span>
                  <span class="edge"></span>
                  <span class="front">
                    Rilancia
                  </span>
              </button>
        </div>
      
    </div>

    
  );
};

export default App;
