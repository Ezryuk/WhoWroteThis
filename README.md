# Who Wrote This
"Who Wrote This" is a game where you have to find who wrote a message in your Messenger group chat.<br/>
This game is played on browser and uses JSON files from Facebook archives and a Node.js server.<br/>
It can be played in multiplayer. With each message found, the player get one point.

#Usage
You first have to install Node.js on your device.<br/>
Then, you have to install all the necessary modules by opening a console at the root of the project and typing this command :
```
npm i
```
You also have to download your JSON files through Facebook :<br/>
Settings & Privacy -> Settings -> Your Facebook Information<br/>
Then download your archive by selecting JSON (not HTML which is selected by default) and let Messenger messages checked.

After that, unzip the JSON files *message_1.json* to *message_X.json* from the group chat that you want (messages -> inbox -> \<name of your group chat\>) in the folder *databases/json/\<name of the group chat\>* (create it if you have to).

Then, open a console at the root and type this command :
```
node src/index.js <name of your group chat>
```
Finally, you can access to the game locally via 127.0.0.1:8080.<br/>
To let other players to join, you have to open the port 8080.
