import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import styles from './App.css'; 

const App = () => {
  const [users, setUsers] = useState([]);
  const [usernameInput, setUsernameInput] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [timer, setTimer] = useState(0);
  const [startButtonDisabled, setStartButtonDisabled] = useState(false);
  const [lastClickedUser, setLastClickedUser] = useState("");
  const [lastRaisedUser, setLastRaisedUser] = useState("");
  const [userSalvato, setUserSalvato] = useState("");

  const socket = io("http://localhost:3001");


  useEffect(() => {
  
    socket.on("users", (_users) => {
      setUsers(_users);
    });

    socket.on("updateTimer", (newTimer) => {
      setTimer(newTimer);
    });  

    socket.on("disableStartButton", () => {
      setStartButtonDisabled(true);
    });

    socket.on("enableStartButton", () => {
      setStartButtonDisabled(false);
    });

    socket.on("showLastClickedUser", (user) => {
      setLastClickedUser(user);
    });

    socket.on("showLastRaisedUser", (user) => {
      setLastRaisedUser(user);
    });

    return () => {
      socket.off("users");
      socket.off("updateTimer");
      socket.off("disableStartButton");
      socket.off("enableStartButton");
      socket.off("showLastClickedUser");
      socket.off("showLastRaisedUser");
    };
  }, []);

  useEffect(() => {
    // Crea un intervallo per il decremento del timer
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer((prevTimer) => prevTimer - 1);
      }else {
        resetStartButton(); // Riabilita il pulsante quando il timer è scaduto
        clearInterval(interval); // Ferma l'intervallo
      }
    }, 1000);

    // Pulisci l'intervallo quando il componente si dismonta
    return () => {
      clearInterval(interval);
      socket.off("disableStartButton"); 
    };
  }, [timer]);

  const addUserAndCloseModal = () => {
    if (!usernameInput) {
      return alert("Devi aggiungere il tuo nome");
    }
    socket.emit("adduser", usernameInput);
    setUserSalvato(usernameInput);
    setShowModal(false);
    setUsernameInput("");
    const backdrop = document.querySelector(".backdrop");
  backdrop.classList.add("disappear");
  };

  const startTimer = () => {
    if (!startButtonDisabled) { // Verifica se il pulsante è abilitato
      socket.emit("startTimer", userSalvato);
      setStartButtonDisabled(true); // Disabilita il pulsante dopo il primo clic
      setLastClickedUser(userSalvato);
    }

  };

  const resetStartButton = () => {
    socket.emit("resetStartButton");
  };

  const resetTimer = () => {
    socket.emit("resetTimer", userSalvato);
    setLastRaisedUser(userSalvato);
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
        <p>Ultimo utente che ha avviato l'asta: {lastClickedUser}</p>
        <p>Ultimo utente che ha rilanciato: {lastRaisedUser}</p>
    </div>

    
  );
};

export default App;
