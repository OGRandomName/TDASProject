import { _decorator, CCFloat, Component, director, Node, Vec2 } from 'cc';
import { EnemyConfig, WhiskerConfig } from './EnemyConfig';
import { Enemy } from './Enemy';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('WhiskerConfigEditor')
export class WhiskerConfigEditor implements WhiskerConfig {
    @property
    startPos: Vec2 = new Vec2

    @property({ type: CCFloat })
    angle: number = 0;

    @property({ type: CCFloat })
    length: number = 50;

}
@ccclass('EnemyConfigTool')
@executeInEditMode
export class EnemyConfigTool extends Component {
    @property({ group: 'Enemy base' })
    public scale: Vec2 = new Vec2(1, 1)

    @property({ group: 'Enemy base', slide: true, range: [0, 100, 1] })
    public health: number = 20

    @property({ group: 'Intent Weights', slide: true, range: [0, 5, 0.1] })
    public seekWeight: number = 1.0

    @property({ group: 'Intent Weights', slide: true, range: [0, 5, 0.1] })
    public fleeWeight: number = 0.0

    @property({ group: 'Intent Weights', slide: true, range: [0, 5, 0.1] })
    public maxPredictionTime: number = 2.0

    @property({ group: 'Intent Weights', slide: true, range: [0, 5, 0.1] })
    public maxSpeed: number = 4.0

    @property({ group: 'Intent Weights', slide: true, range: [0, 400, 10] })
    public spotPlayerDistance: number = 200

    @property({ group: 'Intent Weights', slide: true, range: [0, 500, 10] })
    public lostPlayerDistance: number = 250
    
    @property({ group: 'Movement Weights', slide: true, range: [0, 1, 0.1] })
    public maxTurnForce: number = 0.2

    @property({ group: 'Movement Weights', slide: true, range: [0, 10, 0.1] })
    public avoidWeight: number = 3
    
    @property({ group: 'Movement Weights', slide: true, range: [0, 5, 0.1] })
    public separationWeight: number = 0

    @property({ group: 'Movement Weights', slide: true, range: [0, 150, 5] })
    public separationRadius: number = 50

    @property({ group: 'Movement Weights', slide: true, range: [0, 5, 0.1] })
    public alignmentWeight: number = 0

    @property({ group: 'Movement Weights', slide: true, range: [0,300, 5] })
    public alignmentRadius: number = 100
    
    @property({ group: 'Movement Weights', slide: true, range: [0, 5, 0.1] })
    public cohesionWeight: number = 0

    @property({ group: 'Movement Weights', slide: true, range: [0, 500, 5] })
    public cohesionRadius: number = 200

    @property({ type: [WhiskerConfigEditor], group: 'Whiskers Config' })
    public whiskers: WhiskerConfigEditor[] = [
        (() => {
            let w = new WhiskerConfigEditor();
            w.startPos = new Vec2(0, 0);
            w.angle = 0;
            w.length = 100;
            return w;
        })(),
        (() => {
            let w = new WhiskerConfigEditor();
            w.startPos = new Vec2(0, 0);
            w.angle = 25;
            w.length = 75;
            return w;
        })(),
        (() => {
            let w = new WhiskerConfigEditor();
            w.startPos = new Vec2(0, 0);
            w.angle = -25;
            w.length = 75;
            return w;
        })(),
        (() => {
            let w = new WhiskerConfigEditor();
            w.startPos = new Vec2(0, 0);
            w.angle = 45;
            w.length = 50;
            return w;
        })(),
        (() => {
            let w = new WhiskerConfigEditor();
            w.startPos = new Vec2(0, 0);
            w.angle = -45;
            w.length = 50;
            return w;
        })(),
    ]

    @property ({ group: 'Export Config' })
    public configNamePrefix: string = 'Swarm'

    @property({ group: 'Export Config' })
    get generateJSONFile(): boolean {
        return false;
    }

    set generateJSONFile(value: boolean) {
        if (value) this.generateJSON()
    }
    private enemyConfig: EnemyConfig 
    
    protected onLoad() {
        this.enemyConfig = {
            scale: this.scale,
            health: this.health,
            intent: {
                seekWeight: this.seekWeight,
                fleeWeight: this.fleeWeight,
                maxSpeed: this.maxSpeed,
                maxPredictionTime: this.maxPredictionTime,
                spotPlayerDistance: this.spotPlayerDistance,
                lostPlayerDistance: this.lostPlayerDistance,
            },
            moving: {
                maxTurnForce: this.maxTurnForce,
                avoidWeight: this.avoidWeight,
                flocking: {
                    separationWeight: this.separationWeight,
                    alignmentWeight: this.alignmentWeight,
                    cohesionWeight: this.cohesionWeight,
                    separationRadius: this.separationRadius,
                    alignmentRadius: this.alignmentRadius,
                    cohesionRadius: this.cohesionRadius
                },
                whiskers: this.whiskers
            }
        };
        
        let scene = director.getScene();
        if (scene) {
            let allEnemies = scene.getComponentsInChildren(Enemy);

            for (let enemy of allEnemies) {
                enemy.init(this.enemyConfig);
            }
        }
    }

    private generateJSON() {
        let exportData = this.enemyConfig

        let jsonString = JSON.stringify(exportData, null, 4);
        let filename = `${this.configNamePrefix}_enemyConfig.json`;

        if(EDITOR) {
            try {
                const fs = globalThis.require('fs');
                const path = globalThis.require('path');

                // @ts-ignore
                const projectPath = Editor.Project.path;
                const saveDir = path.join(projectPath, 'assets', 'Configs');

                if (!fs.existsSync(saveDir)) {
                    fs.mkdirSync(saveDir, { recursive: true });
                }
                const savePath = path.join(saveDir, filename);
                fs.writeFileSync(savePath, jsonString);

                let dbURL = `db://assets/Configs/${filename}`;
                if(globalThis.Editor && globalThis.Editor.Message) {
                    globalThis.Editor.Message.send('asset-db', 'refresh-asset', dbURL);
                } else {
                    console.log('[Config Tool] Editor.Message IPC not accessible from this scene Process:');
                }

                
                console.log(`[Config Tool] Exported config to ${savePath}`);
            
            } catch (error) {
                console.error('[Config Tool] Node.js save failed:', error);
            }
        }




}

}
