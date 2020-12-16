# M&M(Mistero al museo)

## Evaluator
This application is used from the employee of the museum or the parent who manages the game. It is composed by 3 components: Chat, Evaluate and Settings.

### CHAT 
The chat component is meant for allowing the evaluator to communicate with the user if he needs it. There is also a section where requests for help is showing, so if users have some problems the evaluator can help them writing on the chat. The client-side and server-side of the chat have been written with the use of Socket.io library to allow real-time communication.

### Evaluate
In this component the evaluator can see the requests arrived to be evaluated. The requests are presented as cards and when you click on the button a modal is opened and then you see the question and what the player has replied, and you evaluate it. 

### Settings 
Settings is divided into 2 sub-menu. In the first you can change the name of the players for the first 15 seconds. In the second second it is possible to check which players have finished the game, and print a JSON with the results. Furthermore you can stop the game for every connected player and this redirect all the player to a 404 page.


## Server
Il server è scritto in [NodeJS](https://nodejs.org/it/) utilizzando in particolare Express e altri moduli installabili con npm e presenti nel file package-lock.json. È diviso in 3 moduli, uno per applicazione, gestiti come middleware dell'applicazione Express. Per riconoscere i diversi giocatori nella chat e gestire le loro richieste viene assegnato un cookie incrementale 'userId'. La chat real-time viene invece gestita da [Socket.io](https://socket.io/). 

## AUTORI
Contatti:
- https://github.com/erikalena
- https://github.com/DaniMoro
