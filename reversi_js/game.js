/**
 * リバーシゲーム - JavaScript完全版
 * Pythonバックエンドなしで動作
 */

const BOARD_SIZE = 8;
const PLAYER_BLACK = 1;
const PLAYER_WHITE = 2;
const PLAYER_EMPTY = 0;

const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

class ReversiGame {
    constructor() {
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(PLAYER_EMPTY));
        this.flip_counts = {}; // {(row, col): flip_count}
        this.current_player = PLAYER_BLACK;
        this.game_over = false;
        this.winner = null;
        this._initializeBoard();
    }
    
    _initializeBoard() {
        const center = Math.floor(BOARD_SIZE / 2);
        this.board[center - 1][center - 1] = PLAYER_WHITE;
        this.board[center - 1][center] = PLAYER_BLACK;
        this.board[center][center - 1] = PLAYER_BLACK;
        this.board[center][center] = PLAYER_WHITE;
        
        // 初期配置の石の反転回数を0に設定
        this.flip_counts[`${center - 1},${center - 1}`] = 0;
        this.flip_counts[`${center - 1},${center}`] = 0;
        this.flip_counts[`${center},${center - 1}`] = 0;
        this.flip_counts[`${center},${center}`] = 0;
    }
    
    isValidMove(row, col, player) {
        if (this.board[row][col] !== PLAYER_EMPTY) {
            return false;
        }
        
        const opponent = player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
        
        for (const [dr, dc] of DIRECTIONS) {
            let r = row + dr;
            let c = col + dc;
            let foundOpponent = false;
            
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
                   this.board[r][c] === opponent) {
                foundOpponent = true;
                r += dr;
                c += dc;
            }
            
            if (foundOpponent && 
                r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
                this.board[r][c] === player) {
                return true;
            }
        }
        
        return false;
    }
    
    getValidMoves(player) {
        const validMoves = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (this.isValidMove(row, col, player)) {
                    validMoves.push([row, col]);
                }
            }
        }
        return validMoves;
    }
    
    makeMove(row, col, player) {
        if (!this.isValidMove(row, col, player)) {
            return false;
        }
        
        const opponent = player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
        const flippedPositions = [];
        
        // 新しい石を配置
        this.board[row][col] = player;
        this.flip_counts[`${row},${col}`] = 0;
        
        // 各方向をチェックして反転
        for (const [dr, dc] of DIRECTIONS) {
            let r = row + dr;
            let c = col + dc;
            const toFlip = [];
            
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
                   this.board[r][c] === opponent) {
                toFlip.push([r, c]);
                r += dr;
                c += dc;
            }
            
            if (toFlip.length > 0 && 
                r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
                this.board[r][c] === player) {
                flippedPositions.push(...toFlip);
            }
        }
        
        // 石を反転させ、反転回数を更新
        for (const [r, c] of flippedPositions) {
            this.board[r][c] = player;
            const key = `${r},${c}`;
            if (this.flip_counts[key] !== undefined) {
                this.flip_counts[key] += 1;
            } else {
                this.flip_counts[key] = 1;
            }
        }
        
        return true;
    }
    
    switchPlayer() {
        this.current_player = this.current_player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
    }
    
    checkGameOver() {
        const blackMoves = this.getValidMoves(PLAYER_BLACK);
        const whiteMoves = this.getValidMoves(PLAYER_WHITE);
        
        if (blackMoves.length === 0 && whiteMoves.length === 0) {
            this.game_over = true;
            this._determineWinner();
            return true;
        }
        
        return false;
    }
    
    _determineWinner() {
        let blackFlipSum = 0;
        let whiteFlipSum = 0;
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const key = `${row},${col}`;
                if (this.board[row][col] === PLAYER_BLACK) {
                    blackFlipSum += this.flip_counts[key] || 0;
                } else if (this.board[row][col] === PLAYER_WHITE) {
                    whiteFlipSum += this.flip_counts[key] || 0;
                }
            }
        }
        
        if (blackFlipSum > whiteFlipSum) {
            this.winner = PLAYER_BLACK;
        } else if (whiteFlipSum > blackFlipSum) {
            this.winner = PLAYER_WHITE;
        } else {
            this.winner = null; // 引き分け
        }
    }
    
    getScore() {
        let blackCount = 0;
        let whiteCount = 0;
        let blackFlipSum = 0;
        let whiteFlipSum = 0;
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const key = `${row},${col}`;
                if (this.board[row][col] === PLAYER_BLACK) {
                    blackCount++;
                    blackFlipSum += this.flip_counts[key] || 0;
                } else if (this.board[row][col] === PLAYER_WHITE) {
                    whiteCount++;
                    whiteFlipSum += this.flip_counts[key] || 0;
                }
            }
        }
        
        return {
            black_count: blackCount,
            white_count: whiteCount,
            black_flip_sum: blackFlipSum,
            white_flip_sum: whiteFlipSum
        };
    }
    
    cpuMove(difficulty = 'easy') {
        const validMoves = this.getValidMoves(this.current_player);
        
        if (validMoves.length === 0) {
            return null;
        }
        
        if (difficulty === 'easy') {
            // ランダムに選択
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        } else if (difficulty === 'medium') {
            // 反転回数の合計が最大になる手を選択
            let bestMove = null;
            let bestScore = -1;
            
            for (const move of validMoves) {
                const testGame = this.clone();
                if (testGame.makeMove(move[0], move[1], this.current_player)) {
                    const score = testGame.getScore();
                    const flipSum = this.current_player === PLAYER_BLACK 
                        ? score.black_flip_sum 
                        : score.white_flip_sum;
                    const pieceCount = this.current_player === PLAYER_BLACK 
                        ? score.black_count 
                        : score.white_count;
                    
                    const moveScore = flipSum * 2 + pieceCount;
                    
                    if (moveScore > bestScore) {
                        bestScore = moveScore;
                        bestMove = move;
                    }
                }
            }
            
            return bestMove || validMoves[Math.floor(Math.random() * validMoves.length)];
        } else { // hard
            return this._getBestMoveAdvanced(validMoves);
        }
    }
    
    _getBestMoveAdvanced(validMoves) {
        // 終盤（残り12手以下）は完全読み
        const totalPieces = this._countPieces();
        const emptySpaces = BOARD_SIZE * BOARD_SIZE - totalPieces;
        if (emptySpaces <= 12) {
            // 残り手数分だけ深く読む
            return this._minimax(validMoves, Math.min(emptySpaces + 2, 14), true);
        }
        
        // 中盤以降はミニマックス法で数手先を読む
        if (totalPieces >= 20) {
            return this._minimax(validMoves, 5, true);
        }
        
        // 序盤は位置評価と戦略的思考
        return this._evaluateMoves(validMoves);
    }
    
    _countPieces() {
        let count = 0;
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (this.board[row][col] !== PLAYER_EMPTY) {
                    count++;
                }
            }
        }
        return count;
    }
    
    _minimax(validMoves, depth, maximizingPlayer) {
        if (validMoves.length === 0) {
            return null;
        }
        
        let bestMove = null;
        let bestValue = maximizingPlayer ? -Infinity : Infinity;
        
        for (const move of validMoves) {
            const testGame = this.clone();
            if (!testGame.makeMove(move[0], move[1], this.current_player)) {
                continue;
            }
            
            testGame.switchPlayer();
            const value = this._minimaxValue(testGame, depth - 1, !maximizingPlayer, -Infinity, Infinity);
            
            if (maximizingPlayer && value > bestValue) {
                bestValue = value;
                bestMove = move;
            } else if (!maximizingPlayer && value < bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }
        
        return bestMove || validMoves[0];
    }
    
    _minimaxValue(game, depth, maximizingPlayer, alpha, beta) {
        // ゲーム終了時は勝敗を直接評価
        if (game.game_over) {
            if (game.winner === this.current_player) {
                return 1000000; // 勝利
            } else if (game.winner === (this.current_player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK)) {
                return -1000000; // 敗北
            } else {
                return 0; // 引き分け
            }
        }
        
        // 深さ制限
        if (depth === 0) {
            return this._evaluatePosition(game, this.current_player);
        }
        
        const currentPlayer = maximizingPlayer ? this.current_player : 
            (this.current_player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK);
        const validMoves = game.getValidMoves(currentPlayer);
        
        if (validMoves.length === 0) {
            // パスの場合
            const nextGame = game.clone();
            nextGame.switchPlayer();
            nextGame.checkGameOver();
            return this._minimaxValue(nextGame, depth - 1, !maximizingPlayer, alpha, beta);
        }
        
        if (maximizingPlayer) {
            let maxValue = -Infinity;
            for (const move of validMoves) {
                const testGame = game.clone();
                if (testGame.makeMove(move[0], move[1], currentPlayer)) {
                    testGame.checkGameOver();
                    if (!testGame.game_over) {
                        testGame.switchPlayer();
                    }
                    const value = this._minimaxValue(testGame, depth - 1, false, alpha, beta);
                    maxValue = Math.max(maxValue, value);
                    alpha = Math.max(alpha, value);
                    if (beta <= alpha) {
                        break; // アルファベータカット
                    }
                }
            }
            return maxValue;
        } else {
            let minValue = Infinity;
            for (const move of validMoves) {
                const testGame = game.clone();
                if (testGame.makeMove(move[0], move[1], currentPlayer)) {
                    testGame.checkGameOver();
                    if (!testGame.game_over) {
                        testGame.switchPlayer();
                    }
                    const value = this._minimaxValue(testGame, depth - 1, true, alpha, beta);
                    minValue = Math.min(minValue, value);
                    beta = Math.min(beta, value);
                    if (beta <= alpha) {
                        break; // アルファベータカット
                    }
                }
            }
            return minValue;
        }
    }
    
    _evaluatePosition(game, player) {
        const score = game.getScore();
        const opponent = player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
        
        // 反転回数の合計（最重要）
        const playerFlipSum = player === PLAYER_BLACK ? score.black_flip_sum : score.white_flip_sum;
        const opponentFlipSum = opponent === PLAYER_BLACK ? score.black_flip_sum : score.white_flip_sum;
        const flipDiff = playerFlipSum - opponentFlipSum;
        
        // 石の数
        const playerCount = player === PLAYER_BLACK ? score.black_count : score.white_count;
        const opponentCount = opponent === PLAYER_BLACK ? score.black_count : score.white_count;
        const countDiff = playerCount - opponentCount;
        
        // 可動性（打てる手の数）- 相手の可動性を制限することが重要
        const playerMoves = game.getValidMoves(player).length;
        const opponentMoves = game.getValidMoves(opponent).length;
        let mobility = 0;
        if (opponentMoves === 0 && playerMoves > 0) {
            // 相手をパスさせる手は非常に価値が高い
            mobility = 100;
        } else {
            mobility = (playerMoves - opponentMoves) * 2;
        }
        
        // 位置の価値
        const positionValue = this._evaluatePositionValue(game, player);
        
        // 安定性（角や端の石）
        const stability = this._evaluateStability(game, player);
        
        // 潜在的な可動性（次のターンに打てる可能性のある位置）
        const potentialMobility = this._evaluatePotentialMobility(game, player);
        
        // 重み付け評価（終盤に近づくほど反転回数が重要）
        let totalPieces = 0;
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (game.board[row][col] !== PLAYER_EMPTY) {
                    totalPieces++;
                }
            }
        }
        const gamePhase = totalPieces / (BOARD_SIZE * BOARD_SIZE);
        const flipWeight = gamePhase > 0.7 ? 2000 : 1000; // 終盤は反転回数をより重視
        
        return flipDiff * flipWeight + 
               positionValue * 50 + 
               stability * 30 + 
               mobility * 15 + 
               potentialMobility * 5 +
               countDiff * 5;
    }
    
    _evaluatePotentialMobility(game, player) {
        // 次に打てる可能性のある位置の数を評価
        const opponent = player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
        let potential = 0;
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (game.board[row][col] === PLAYER_EMPTY) {
                    // この位置が将来打てる可能性があるかチェック
                    if (game.isValidMove(row, col, player)) {
                        potential += 1;
                    }
                }
            }
        }
        
        return potential;
    }
    
    _evaluatePositionValue(game, player) {
        // 位置の価値テーブル（角が最も価値が高い）
        const positionWeights = [
            [100, -20, 10, 5, 5, 10, -20, 100],
            [-20, -50, -5, -5, -5, -5, -50, -20],
            [10, -5, 5, 0, 0, 5, -5, 10],
            [5, -5, 0, 0, 0, 0, -5, 5],
            [5, -5, 0, 0, 0, 0, -5, 5],
            [10, -5, 5, 0, 0, 5, -5, 10],
            [-20, -50, -5, -5, -5, -5, -50, -20],
            [100, -20, 10, 5, 5, 10, -20, 100]
        ];
        
        let value = 0;
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (game.board[row][col] === player) {
                    value += positionWeights[row][col];
                } else if (game.board[row][col] !== PLAYER_EMPTY) {
                    value -= positionWeights[row][col];
                }
            }
        }
        return value;
    }
    
    _evaluateStability(game, player) {
        // 角の石は安定
        const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
        let stability = 0;
        
        for (const [row, col] of corners) {
            if (game.board[row][col] === player) {
                stability += 10;
            } else if (game.board[row][col] !== PLAYER_EMPTY) {
                stability -= 10;
            }
        }
        
        // 端の石も比較的安定
        for (let i = 0; i < BOARD_SIZE; i++) {
            if (game.board[0][i] === player) stability += 2;
            if (game.board[7][i] === player) stability += 2;
            if (game.board[i][0] === player) stability += 2;
            if (game.board[i][7] === player) stability += 2;
        }
        
        return stability;
    }
    
    _evaluateMoves(validMoves) {
        const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
        const cornerAdjacent = [];
        
        // 角の隣の位置を計算
        for (const corner of corners) {
            for (const [dr, dc] of DIRECTIONS) {
                const adj = [corner[0] + dr, corner[1] + dc];
                if (adj[0] >= 0 && adj[0] < BOARD_SIZE && adj[1] >= 0 && adj[1] < BOARD_SIZE) {
                    const isAdjacent = validMoves.some(move => move[0] === adj[0] && move[1] === adj[1]);
                    const alreadyAdded = cornerAdjacent.some(ca => ca[0] === adj[0] && ca[1] === adj[1]);
                    if (isAdjacent && !alreadyAdded) {
                        cornerAdjacent.push(adj);
                    }
                }
            }
        }
        
        // 角が取れる場合は優先
        for (const move of validMoves) {
            if (corners.some(corner => corner[0] === move[0] && corner[1] === move[1])) {
                return move;
            }
        }
        
        // 角の隣を避ける
        const safeMoves = validMoves.filter(move => 
            !cornerAdjacent.some(ca => ca[0] === move[0] && ca[1] === move[1])
        );
        
        if (safeMoves.length === 0) {
            safeMoves.push(...validMoves);
        }
        
        // 各手を評価
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of safeMoves) {
            const testGame = this.clone();
            if (!testGame.makeMove(move[0], move[1], this.current_player)) {
                continue;
            }
            
            const score = this._evaluatePosition(testGame, this.current_player);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove || safeMoves[0];
    }
    
    clone() {
        const cloned = new ReversiGame();
        cloned.board = this.board.map(row => [...row]);
        cloned.flip_counts = {...this.flip_counts};
        cloned.current_player = this.current_player;
        cloned.game_over = this.game_over;
        cloned.winner = this.winner;
        return cloned;
    }
}

// ゲーム状態
let game = null;
let gameMode = 'human'; // 'human' or 'cpu'
let difficulty = 'easy';
let showFlipCounts = true;

// DOM要素
const boardElement = document.getElementById('board');
const btnNewGame = document.getElementById('btn-new-game');
const btnHuman = document.getElementById('btn-human');
const btnCpu = document.getElementById('btn-cpu');
const cpuDifficulty = document.getElementById('cpu-difficulty');
const currentPlayerName = document.getElementById('current-player-name');
const messageElement = document.getElementById('message');
const cpuLabel = document.getElementById('cpu-label');
const humanLabel = document.getElementById('human-label');
const showFlipCountsCheckbox = document.getElementById('show-flip-counts');

// イベントリスナー
btnNewGame.addEventListener('click', startNewGame);
btnHuman.addEventListener('click', () => setGameMode('human'));
btnCpu.addEventListener('click', () => setGameMode('cpu'));
showFlipCountsCheckbox.addEventListener('change', (e) => {
    showFlipCounts = e.target.checked;
    if (game) {
        renderBoard();
    }
});

// ゲームモード設定
function setGameMode(mode) {
    gameMode = mode;
    if (mode === 'cpu') {
        btnCpu.classList.add('active');
        btnHuman.classList.remove('active');
        cpuDifficulty.style.display = 'block';
        cpuLabel.style.display = 'inline';
        humanLabel.style.display = 'none';
        difficulty = document.getElementById('difficulty-select').value;
    } else {
        btnHuman.classList.add('active');
        btnCpu.classList.remove('active');
        cpuDifficulty.style.display = 'none';
        cpuLabel.style.display = 'none';
        humanLabel.style.display = 'inline';
    }
    if (game) {
        startNewGame();
    }
}

// 新しいゲームを開始
function startNewGame() {
    game = new ReversiGame();
    renderBoard();
    updateUI();
    clearMessage();
}

// 手を打つ
function makeMove(row, col) {
    if (!game || game.game_over) {
        return;
    }
    
    // 対人対戦モードでは、現在のプレイヤーの手を打てる
    // CPU対戦モードでは、黒（プレイヤー）の手のみ
    if (gameMode === 'cpu' && game.current_player !== PLAYER_BLACK) {
        showMessage('あなたのターンではありません', 'warning');
        return;
    }
    
    // 有効な手かチェック
    const validMoves = game.getValidMoves(game.current_player);
    const isValidMove = validMoves.some(move => move[0] === row && move[1] === col);
    
    if (!isValidMove) {
        showMessage('無効な手です', 'warning');
        return;
    }
    
    if (game.makeMove(row, col, game.current_player)) {
        game.checkGameOver();
        if (!game.game_over) {
            game.switchPlayer();
        }
        renderBoard();
        updateUI();
        
        // CPU対戦モードの場合、CPUの手を実行
        if (gameMode === 'cpu' && !game.game_over && game.current_player === PLAYER_WHITE) {
            setTimeout(() => executeCpuMove(), 500);
        }
    }
}

// CPUの手を実行
function executeCpuMove() {
    if (!game || game.game_over) {
        return;
    }
    
    difficulty = document.getElementById('difficulty-select').value;
    const move = game.cpuMove(difficulty);
    
    if (move) {
        game.makeMove(move[0], move[1], game.current_player);
        game.checkGameOver();
        if (!game.game_over) {
            game.switchPlayer();
        }
        renderBoard();
        updateUI();
    } else {
        // CPUに有効な手がない場合
        game.switchPlayer();
        game.checkGameOver();
        renderBoard();
        updateUI();
    }
}

// ボードを描画
function renderBoard() {
    boardElement.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const piece = game.board[row][col];
            const key = `${row},${col}`;
            const flipCount = game.flip_counts[key] || 0;
            
            if (piece === PLAYER_BLACK) {
                cell.classList.add('black');
                if (showFlipCounts && flipCount > 0) {
                    const flipCountSpan = document.createElement('span');
                    flipCountSpan.className = 'flip-count';
                    flipCountSpan.textContent = flipCount;
                    cell.appendChild(flipCountSpan);
                }
                cell.title = flipCount > 0 ? `反転回数: ${flipCount}` : '';
            } else if (piece === PLAYER_WHITE) {
                cell.classList.add('white');
                if (showFlipCounts && flipCount > 0) {
                    const flipCountSpan = document.createElement('span');
                    flipCountSpan.className = 'flip-count';
                    flipCountSpan.textContent = flipCount;
                    cell.appendChild(flipCountSpan);
                }
                cell.title = flipCount > 0 ? `反転回数: ${flipCount}` : '';
            } else {
                // 有効な手の位置を表示
                const validMoves = game.getValidMoves(game.current_player);
                const isValidMove = validMoves.some(move => move[0] === row && move[1] === col);
                if (isValidMove) {
                    // 対人対戦モードでは常に表示、CPU対戦モードでは黒のターンのみ
                    if (gameMode === 'human' || game.current_player === PLAYER_BLACK) {
                        cell.classList.add('valid-move');
                        cell.addEventListener('click', () => makeMove(row, col));
                    }
                }
            }
            
            boardElement.appendChild(cell);
        }
    }
}

// UIを更新
function updateUI() {
    if (!game) return;
    
    const score = game.getScore();
    
    // スコア更新
    document.getElementById('black-count').textContent = score.black_count;
    document.getElementById('white-count').textContent = score.white_count;
    document.getElementById('black-flip-sum').textContent = score.black_flip_sum;
    document.getElementById('white-flip-sum').textContent = score.white_flip_sum;
    
    // 現在のプレイヤー表示
    const currentPlayer = game.current_player === PLAYER_BLACK ? '黒' : '白';
    currentPlayerName.textContent = currentPlayer;
    currentPlayerName.className = game.current_player === PLAYER_BLACK ? 'black' : 'white';
    
    // ゲーム終了時のメッセージ
    if (game.game_over) {
        let message = '';
        if (game.winner === PLAYER_BLACK) {
            message = '黒の勝利！反転回数の合計が多かったです。';
        } else if (game.winner === PLAYER_WHITE) {
            message = gameMode === 'cpu' ? 'CPUの勝利！' : '白の勝利！反転回数の合計が多かったです。';
        } else {
            message = '引き分けです！';
        }
        showMessage(message, 'success');
    } else {
        // 有効な手がない場合
        const validMoves = game.getValidMoves(game.current_player);
        if (validMoves.length === 0) {
            const playerName = game.current_player === PLAYER_BLACK ? '黒' : '白';
            showMessage(`${playerName}は打てる手がありません。スキップします。`, 'info');
            
            // 自動的にスキップ
            setTimeout(() => {
                game.switchPlayer();
                game.checkGameOver();
                renderBoard();
                updateUI();
                
                // CPU対戦モードでCPUのターンになった場合
                if (gameMode === 'cpu' && !game.game_over && game.current_player === PLAYER_WHITE) {
                    setTimeout(() => executeCpuMove(), 500);
                }
            }, 1000);
        }
    }
}

// メッセージを表示
function showMessage(text, type = 'info') {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
}

// メッセージをクリア
function clearMessage() {
    messageElement.style.display = 'none';
    messageElement.className = 'message';
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    startNewGame();
});

