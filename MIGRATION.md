# Micropolis Java to HTML5 Migration Tracking

## Core Simulation Engine Status

- [ ] CityBudget.java ➔ 'src/engine/CityBudget.js'
- [ ] CityDimension.java
- [ ] CityEval.java
- [ ] CityLocation.java
- [ ] CityProblem.java
- [ ] CityRect.java
- [ ] Disaster.java
- [ ] EarthquakeListener.java
- [ ] ExplosionSprite.java
- [ ] GameLevel.java
- [ ] HelicopterSprite.java
- [ ] MapGenerator.java
- [ ] MapListener.java
- [ ] MapScanner.java
- [ ] MapState.java
- [ ] Micropolis.java ➔ micropolis.js
- [ ] MicropolisMessage.java
- [ ] MicropolisTool.java
- [ ] MonsterSprite.java
- [ ] package.html
- [ ] RoadLikeTool.java
- [ ] ShipSprite.java
- [ ] Sound.java
- [ ] Speed.java
- [ ] Sprite.java
- [ ] SpriteKind.java
- [ ] TerrainBehavior.java
- [ ] TileBehavior.java
- [ ] TileConstants.java
- [ ] Tiles.java
- [ ] TileSpec.java
- [ ] ToolEffect.java
- [ ] ToolEffectIfc.java
- [ ] ToolPreview.java
- [ ] ToolResult.java
- [ ] ToolStroke.java
- [ ] TornadoSprite.java
- [ ] TrafficGen.java
- [ ] TrainSprite.java
- [ ] TranslatedToolEffect.java
- [ ] ZoneStatus.java

## Build Tool Status

- [ ] MakeTiles.java
- [ ] RearrangeTiles.java

## Graphics Status

- [ ] Animation.java
- [ ] TileImage.java

## GUI Status

- [ ] BudgetDialog.java
- [ ] ColorParser.java
- [ ] DemandIndicator.java
- [ ] EvaluationPane.java
- [ ] GraphsPane.java
- [ ] MainWindow.java
- [ ] MessagesPane.java
- [ ] MicropolisDrawingArea.java
- [ ] NewCityDialog.java
- [ ] NotificationPane.java
- [ ] OverlayMapView.java
- [ ] package.html
- [ ] TileImages.java

## Utils Status

- [ ] StringsModel.java
- [ ] TranslatedStringsTable.java
- [ ] TranslationTool.java

## Other files

- [ ] Main.java
- [ ] XML_Helper.java

## Architectural Divergences

Micropolis.java is to be tackled first. As it is a massive module with almost 3k lines of code, it will be split in smaller modules to be easier to maintain.

As a result, Micropolis.java will become:

- micropolis.js : hub and state orchestrator
- mapGrid.js : handles memory grids, smoothing and bounds
- simulationClock.js : controls tick cycles
- censusManager.js : statistical aggregates and historical charts
- demandValves.js : RCI economic calculation engine
- powerGrid.js : conductive network pathfinding
- disasterManager.js : disaster RNG and management hooks
- eventEmitter.js : replaces nested interfaces with an event hub

eventEmitter.js
The java port uses multiple interfaces and looping arrays to update components. This will be changed to a native Event Target system.

mapGrid.js
The port instantiates dozens of separate multi-dimensional arrays at different scale factors (char[][] map at 100%, int[][] landValueMem at 50%, int[][] terrainMem at 25%, int[][] fireStMap at 12.5%). This degrades garbage collection performance in JS.
The solution will be to isolate all map access data and calculations (like the doSmooth logic used for map generation) inside a single class using flat TypedArrays.

simulationClock.js
In java the entire 16-step execution lifecycle is bundled inside a long switch(mod16) block within the core state container.
In javascript, the timing parameters, loop frames (fcycle, scycle, acycle), phase tracking, and step loops will be moved completely into an engine clock class.

demandValves.js
The internal economic algorithm uses mathematical equations directly editing global attributes (normResPop, projectedComPop, laborBase).
The solution will be to wrap all this code cleanly within an independent economic module that takes census results as parameters and updates the engine's current economic state variables (resValve, comValve, indValve).
