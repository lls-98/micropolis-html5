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
