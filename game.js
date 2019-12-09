/*
	Pre-coding brainstorming:
	
	Objects needed and where they will be stored:

		Modules (only need one instance of...):
			gameboard
			displayController

		Factories (need multiple instances of...):
			player


	UPDATE brainstorming 4/11/19
		Currently players can place tokens in empty spots. The console shows when the game 
		is either a tie or a win. 
		
		Things to do:
		- Highlight the name of the current player
		- Declare the winner of the game
		- Reset board if game is over
		- Keep track of player points
*/

/*
	================
	PLAYER factory
	================
*/
const Player = (name, piece, id) => {
	let score = 0;
	let turn = 0;

	return { name, piece, score, turn, id };
};


/*
	================
	GAMEBOARD module
	================
*/
const Gameboard = (function () {
	// Holds the values of each gameboard spot in an array
	let gameboard = Array(9).fill('');

	// Checks to see if board is full
	const isFull = function() {
		return gameboard.every(spot => spot != '') ? true : false;
	};

	// Checks to see if spot on HTML board is empty
	const spotEmpty = function(selector) {
		return selector.innerHTML.trim().length < 1;
	};

	// Event handler for spots on board
	const makeSpotsClickable = function() {
		const spots = document.querySelectorAll('.spot');
		spots.forEach(spot => {
			spot.addEventListener('click', (e) => {
				Display.addPieceToBoard(e);
			})
		})
	};

	// Removes content from all board spots using an array of empty strings
	const reset = function() {
		this.gameboard = Array(9).fill('');
	};

	return { gameboard, isFull, spotEmpty, makeSpotsClickable, reset };
})();




/*
	==============
	GAME module
	==============
*/
const Game = (() => {
	let players = [Player('', 'x', 1), Player('', 'o', 2)];
	let current = players[0];
	players[0].turn = 1;

	// Winning combo possibilities held in array 
	const winningMoves = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
		[1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
	];

	// Sets up and initiates the game
	const start = function() {
		const player = document.querySelector('.player1');
		player.classList.toggle('current');
		Display.updateNames();
		Display.updateScores();
		Gameboard.makeSpotsClickable();
	};

	// Checks for a winning combo on board
	const checkForWin = function() {
		let win = false;
		winningMoves.forEach(line => {
			let boardLine = [];
			line.forEach(spot => boardLine.push(Gameboard.gameboard[spot]));
			if (boardLine.every(spot => (spot === boardLine[0]) && (spot != ''))) win = true;
		});
		return win;
	};

	// Checks for tie
	const checkForTie = function() {
		return Gameboard.isFull() && !checkForWin() ? true : false;
	};

	// Returns current player based on who has a 'turn' value of 1
	const getCurrentPlayer = function() {
		[players[0].turn, players[1].turn] = players[0].turn ? [0, 1] : [1, 0]; 
		
		return players[0].turn ? players[0] : players[1];
	};

	const swapPlayerObjects = function() {
		[players[0].turn, players[1].turn] = players[0].turn ? [0, 1] : [1, 0];
		Game.current = players[0].turn ? players[0] : players[1];
		// console.log(current);
	};

	const swapPlayers = function() {
		swapPlayerObjects();
		Display.swapCurrent();
	};

	/*
	if there is a win --> announce winner, update scores, and reset board
	if there is a tie --> announce tie, update scores, and reset board
	*/

	const endGame = function() {
		if (checkForWin()) {
			console.log('win');
			Display.showBox('win');
			
		} else if (Gameboard.isFull()) {
			console.log('full');
			Display.showBox('tie');
		}
	}

	const reset = function() {
		this.players = [Player('', 'x', 1), Player('', 'o', 2)];
		this.players[0].turn = 1;
		this.current = players[0];
		Gameboard.reset();
		Display.clearBoard();
		Display.showBox('form');
	}

	return { players, checkForWin, checkForTie, start, players, getCurrentPlayer, current, endGame, swapPlayers, reset, winningMoves };
})();

/*
	==============
	DISPLAY module
	==============
*/
const playerDivs = document.querySelectorAll('.player');

const Display = (function () {
	// Updates individual DOM element with current player's piece
	const addPieceToBoard = function(e) {
		const key = e.target.dataset.key;
		const div = document.querySelector(`.spot[data-key="${key}"]`);
		if (Gameboard.spotEmpty(div)) {
			div.textContent = Game.current.piece;
			Gameboard.gameboard[key] = Game.current.piece;
			Game.endGame();
			Game.swapPlayers();
		}
	};

	// Setup names on board 
	const updateNames = function() {
		for (let i = 1; i < 3; i++) {
			const player = document.querySelector(`.player${i}-name`);
			const name = document.getElementById(`player${i}`).value;
			player.textContent = `${name} (${Game.players[i - 1].piece})`;
			Game.players[i - 1].name = name;
		}
	};

	// Updates player scores
	const updateScores = function() {
		for (let i = 1; i < 3; i++) {
			const player = document.querySelector(`.player${i}`);
			player.lastElementChild.textContent = Game.players[i - 1].score;
		}
	};

	// Manually toggle between pop-up and game displays
	const gameDisplay = function(mode) {
		const mainDivs = document.querySelectorAll('.main');
		const box = document.querySelector('.box');
		if (mode === 'box') {
			mainDivs.forEach(div => div.classList.remove('full'));
			box.classList.remove('hidden');
		} else if (mode === 'game') {
				mainDivs.forEach(div => div.classList.add('full'));
				box.classList.add('hidden');
		}
	}

	const showBox = function(type) {
		gameDisplay('box');
		const box = document.querySelector('.box');
		let content = document.createElement('div');

		// Removes all content from pop-up box
		while (box.firstChild) {
			box.removeChild(box.firstChild);
		}

		if (type === 'form') {
			content.classList.add('start-form');
			content.innerHTML = `
				<form class="start-form">
					<label>Player 1</label>
					<input type="text" class="name-input" id="player1" placeholder="Name">
					<label>Player 2</label>
					<input type="text" class="name-input" id="player2" placeholder="Name">
				</form>
				<button class="button start-button">START</button>
			`;
		} else if (type === 'win') {
			console.log('yeswin');	
				content.innerHTML = `
					<p>${Game.current.name} is the winner!</p>
					<button class="button rematch-button">REMATCH</button>
					<button class="button reset-button">RESET</button>
				`
		} else if (type === 'tie') {
				content.innerHTML = `
					<p>Game is a tie...</p>
					<button class="button rematch-button">REMATCH</button>
					<button class="button reset-button">RESET</button>
				`;
		}	

		box.appendChild(content);
		if (type === 'form') _startButton();
		if (type ==='win' || type === 'tie') resetButton();
	};

	const _startButton = function(e) {
		const start = document.querySelector('.start-button');
		start.addEventListener('click', (e) => {
			gameDisplay('game');
			Game.start();
		})
	};

	const resetButton = function(e) {
		const reset = document.querySelector('.reset-button');
		reset.addEventListener('click', (e) => {
			gameDisplay('box');
			Game.reset();
		});
	};

	// =========== private ==============

	// Toggles current class to highlight playeron scoreboard
	const swapCurrent = function() {
		playerDivs.forEach(player => player.classList.toggle('current'));
	}

	// Event handler for reset button
	const _permitReset = function() {
		const reset = document.querySelector('.reset-button');
		reset.style.visibility = 'initial';
		reset.addEventListener('click', (e) => {
			Game.reset();
		});
	};

	const clearBoard = function() {
		const board = document.querySelectorAll('.spot');
		const players = document.querySelectorAll('.player');
		board.forEach(spot => spot.textContent = '');
		players.forEach(player => player.classList.remove('current'));
	}

	return { 
		addPieceToBoard, 
		updateScores, 
		updateNames,  
		showBox, 
		swapCurrent, 
		clearBoard,
		gameDisplay,
		resetButton
	}
})();


// Script executed upon page load
Display.gameDisplay('box');
Display.showBox('form');
Display.resetButton();




// const testModule = (function() {
// 	let fruit = 'orange';

// 	const changeFruit = function() {
// 		this.fruit = 'banana';
// 	}

// 	return { fruit, changeFruit };
// })();

// console.log(testModule.fruit); // orange

// testModule.changeFruit();
// console.log(testModule.fruit); // orange

// testModule.fruit = 'grape';
// console.log(testModule.fruit); // grape

