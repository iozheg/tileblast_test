# TileBlast Game

- A match-3 tile blast puzzle game built with Cocos Creator using TypeScript.

## Game Summary

TileBlast is a tile-matching puzzle game where players click on groups of connected tiles of the same type to remove them from the board. The game features:

- **Group-based matching**: Click on connected tiles of the same color/type to remove them
- **Special tiles**: Created when removing large groups, with powerful destruction abilities
- **Chain reactions**: Special tiles can trigger other special tiles for massive combos
- **Gravity system**: Tiles fall down when others are removed, creating new matching opportunities
- **Progress tracking**: Score-based or move-based progression systems
- **Auto-shuffle**: Board reshuffles when no moves are available

## Architecture Overview

The game follows a clean **Model-View-Controller (MVC)** architecture with additional service layers:

```
GameController (Main Game Loop)
├── BoardController (Board Management)
│   ├── BoardModel (Game State)
│   ├── TileController[] (Individual Tile Management)
│   │   └── TileView (Visual Representation)
│   └── TileLifecycleManager (Tile Creation/Destruction)
├── ProgressController (Goal Tracking)
└── DialogController (UI Management)
```

### Core Entity Relations

**Centered on TileModel:**

```
[BoardModel] ──owns──> [TileModel[]] <──maps to──> [TileController] ──controls──> [TileView]
  │                      │                           │
  └──manages groups──────┘                           └──handles input──> [BoardController]
```

**Data Flow:**

1. **User Input**: TileView → TileController → BoardController
2. **Game Logic**: BoardController → BoardModel → TileModel updates
3. **Visual Updates**: TileModel changes → TileController → TileView animations

### Key Components

#### Models (Data Layer)

- **TileModel**: Represents individual tile state (position, type, group, behavior)
- **BoardModel**: Manages the game grid, tile positioning, and group calculations
- **TypedTile**: Interface for tile-like objects

#### Controllers (Logic Layer)

- **GameController**: Main game orchestrator, manages win/loss conditions
- **BoardController**: Handles board interactions, tile removal, and special tile logic
- **TileController**: Manages individual tile behavior and positioning
- **ProgressController**: Tracks game objectives and progression

#### Views (Presentation Layer)

- **TileView**: Visual representation and animations for individual tiles
- **DialogView**: UI dialogs for game over states

#### Services

- **TileBehaviourService**: Implements special tile behaviors (row/column/region destroyers)
- **TileModelFactory**: Object pooling for tile creation/destruction
- **TileControllerFactory**: Object pooling for tile controller management
- **EffectProcessor**: Manages sequential effect execution and chain reactions

## Configurable Scene Objects

### BoardController Properties

The main configurable component in the scene with the following properties:

#### Board Configuration

- **`numColumns`** (Integer): Number of columns in the game grid (default: 8)
- **`numRows`** (Integer): Number of rows in the game grid (default: 7)
- **`usedTileTypes`** (Integer): Number of different tile types to use from the available types (default: 4)
- **`shuffleAttempts`** (Integer): Maximum number of shuffle attempts when no moves are available (default: 3)

#### Scene References

- **`board`** (Node): Container node for the game board
- **`tileContainer`** (Node): Container where tile nodes are instantiated
- **`tileLifecycleManager`** (TileLifecycleManager): Manages tile creation, effects, and destruction

#### Tile Type Configuration

- **`tileTypes`** (TileType[]): Array of available regular tile types
- **`specialTileTypes`** (TileType[]): Array of special tile types for power-ups

### TileType Configuration

Each TileType object contains:

- **`type`** (String): Unique identifier for the tile type
- **`sprite`** (SpriteFrame): Visual representation of the tile

### TileLifecycleManager Properties

Handles visual effects and tile management:

- **`tilePrefab`** (Prefab): Prefab used for creating tile instances
- **`tileRemoveParticles`** (Prefab): Particle effect for normal tile removal
- **`bombParticles`** (Prefab): Particle effect for special tile explosions

### Special Tile Behaviors

The game supports multiple special tile types with different destruction patterns:

1. **RowDestroyer**: Destroys entire horizontal row
2. **ColumnDestroyer**: Destroys entire vertical column
3. **RegionDestroyer**: Destroys 3x3 area around the tile
4. **FieldDestroyer**: Destroys all tiles on the board

Special tiles are automatically created when removing large groups:

- **5+ tiles**: Creates Row or Column Destroyer (random)
- **7+ tiles**: Creates Region Destroyer
- **9+ tiles**: Creates Field Destroyer

### Progress System

The game uses an abstract `ProgressControllerBase` that can be extended for different game modes:

- **Score-based progression**: Reach target score
- **Move-based progression**: Complete objectives within limited moves
- **Custom objectives**: Implement specific game mode requirements

## Technical Features

- **Object Pooling**: Efficient memory management for tiles and effects
- **Sequential Effects**: Chain reactions process in order with visual delays
- **Gravity System**: Automatic tile repositioning when spaces are created
- **Touch Input**: Responsive tile selection and interaction
- **Particle Effects**: Visual feedback for tile destruction
- **Auto-shuffle**: Ensures playable board states

## Development Setup

This is a Cocos Creator project. Open the project folder in Cocos Creator to begin development.

### Key Directories

- `/assets/TileBlast/Scripts/`: TypeScript source code
- `/assets/TileBlast/Content/`: Game assets (sprites, prefabs, particles)
- `/assets/TileBlast/Scene/`: Game scenes

_(NOTE: This description made with AI)_
