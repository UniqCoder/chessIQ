# ChessIQ: Project Architecture & Documentation

## 1. Project Overview
ChessIQ is a premium, local pass-and-play chess web application. It is designed to provide a highly polished, distraction-free environment for two players to play chess on the same device. The core game logic is completely decoupled from the UI, running as a blazing-fast, standalone C++ engine, while the modern frontend is built with Next.js and styled with Tailwind CSS to achieve a dark-luxury aesthetic.

## 2. Technology Stack
- **Frontend**: Next.js (React Framework), TypeScript, Tailwind CSS, Framer Motion (for UI transitions).
- **Backend Game Engine**: Standard C++17.
- **Engine-to-Web Bridge**: Node.js `child_process` (JSON payload streaming via standard I/O).
- **State Persistence**: Browser `localStorage` (ensuring 100% offline portability with zero database setup).

## 3. Game Logic & Custom Data Structures (C++)
The most significant architectural decision of this project was to implement the chess engine entirely from scratch using fundamental C++ concepts, **explicitly avoiding the Standard Template Library (STL)** containers like `std::vector`, `std::map`, or `std::queue`. This ensures absolute memory efficiency, zero external dependencies, and demonstrates a rigorous understanding of low-level memory management.

### Custom Data Structures Implemented
1. **Dynamic Array (`stack.h`)**:
   Instead of relying on `std::vector`, we built a custom template-based stack/dynamic array that uses raw pointer memory allocation (`T* data`). It manually handles dynamic resizing (doubling capacity when full) and strict memory cleanup in the destructor. This structure is heavily utilized to store and return the dynamically calculated lists of legal chess moves.
2. **Circular Queue (`queue.h`)**:
   Instead of `std::queue`, we implemented a fixed-capacity ring buffer using a raw underlying array. This structure efficiently manages sequence states without needing to physically shift memory indices backward during pop operations.
3. **Hash Map (`hash.h`)**:
   Instead of `std::unordered_map`, we implemented a custom separate-chaining Hash Table from scratch. It uses an array of linked-list nodes to resolve hash collisions, which allows the engine to securely cache game sessions or state lookups in constant time.
4. **2D Primitive Arrays (`board.h`)**:
   The chessboard itself is strictly modeled as a primitive `int board[8][8]` rather than complex nested object graphs. Each integer maps directly to a specific piece type and color using bitwise/integer constants, allowing for lightning-fast array traversal during game simulations.

### Core Logic Implementation
- **Move Generation**: The logic iterates through the 8x8 array. For a selected piece, it calculates raw pseudo-legal moves based strictly on board geometry (e.g., a Bishop recursively checks diagonal rays using while-loops until it hits a board edge or another piece).
- **Check & Legal Move Validation**: To ensure a move doesn't illegally leave the King in check, the engine utilizes a cloning simulation: it creates a "hypothetical" temporary board state, simulates the desired move, and then aggressively scans the board to see if any enemy piece has a valid attack ray on the King's new square. If safe, the move is pushed to our custom `Stack`.
- **The API Bridge**: The C++ executable acts as a stateless microservice. It runs an infinite loop reading from `std::cin`. When the Next.js server receives a frontend move, it writes a JSON string (containing the FEN string and the command) directly into the C++ engine's standard input stream. The C++ code parses the string manually without external JSON libraries, computes the chess mathematics, and prints the result back to `std::stdout`.

## 4. How to Run the Project on ANY PC
Because we engineered the data layer to utilize `localStorage`, you can share this exact folder with anyone and they can play immediately without setting up databases or cloud services.

### Prerequisites
Make sure the target PC has **Node.js** installed.

### Step 1: Open the Frontend folder
Open your terminal (Command Prompt, PowerShell, or VS Code Terminal) and navigate to the `frontend` directory:
```bash
cd frontend
```

### Step 2: Install Node Dependencies
Run the following command to download the required React packages:
```bash
npm install
```

### Step 3: Start the Server
Run the Next.js development server:
```bash
npm run dev
```

### Step 4: Play!
Open your web browser and go to `http://localhost:3000`. You can immediately sign up (auth is simulated locally), go to the dashboard, and click "Start Local Match". 

*(Note: If the C++ engine fails to run on a completely different operating system like a Mac or Linux machine, you simply need to recompile the engine by navigating to the `backend` folder and running `g++ -std=c++17 -Iinclude -o chessiq_engine src/main.cpp src/game.cpp src/board.cpp`, then updating the `.env.local` file to point to the new binary).*
