import { _decorator, Component, find, instantiate, JsonAsset, log, Node, Prefab, UITransform, Vec2 } from 'cc';
import { Enemy } from './Enemy';
import { EnemyConfig } from './EnemyConfig';
import { EventBus, GameEvents } from './EventBus';
const { ccclass, property } = _decorator;

@ccclass('Wavefactory')
export class Wavefactory extends Component {

    @property({ type: Node, group: 'Spawning Setup' })
    public enemyContainer: Node | null = null;

    @property({ type: Node, group: 'Spawning Setup' })
    public targetNode: Node | null = null;

    @property({ type: [Node], group: 'Spawning Setup' })
    public wanderNodes: Node[] = [];

    @property({ type: [Prefab], group: 'Normal Wave' })
    public enemyPrefabs: Prefab[] = [];

    @property({ type: [JsonAsset], group: 'Normal Wave' })
    public waveConfigs: JsonAsset[] = [];

    @property({ type: [Prefab], group: 'Boss Wave' })
    public bossPrefabs: Prefab[] = [];

    @property({ type: JsonAsset, group: 'Boss Wave' })
    public bossConfig: JsonAsset | null = null;

    private spawnRadius = 0;

    protected onLoad(): void {
        const canvasNode = find('Canvas');
        const uiTransform = canvasNode?.getComponent(UITransform);
        if (uiTransform) {
            this.spawnRadius = Math.min(uiTransform.contentSize.width, uiTransform.contentSize.height) * 0.5;
        } else {
            this.spawnRadius = 960;
        }
    }

    public buildWave(waveIndex: number, isBossStage = false): Enemy[] {
        if (!this.enemyContainer || !this.targetNode || this.waveConfigs.length === 0 || this.enemyPrefabs.length === 0) {
            log('[Wavefactory] Missing dependencies in the inspector');
            return [];
        }

        const config = this.determineEnemyConfig(waveIndex, isBossStage);
        if (!config) {
            log('[Wavefactory] EnemyConfig is null, aborting wave build');
            return [];
        }

        const prefab = this.determinePrefab(waveIndex, isBossStage);
        if (!prefab) {
            log('[Wavefactory] Prefab is null, aborting wave build');
            return [];
        }

        const spawnCount = Math.min(2 + waveIndex * 4, 50);

        const wanderPoints = this.wanderNodes.map(node =>
            new Vec2(node.worldPosition.x, node.worldPosition.y)
        );

        return this.generateRadialWave(
            prefab,
            this.enemyContainer,
            spawnCount,
            this.spawnRadius,
            config,
            this.targetNode,
            wanderPoints
        );
    }

    private determineEnemyConfig(waveIndex: number, bossStage: boolean): EnemyConfig | null {
        if (bossStage && this.bossConfig) {
            return this.bossConfig.json as unknown as EnemyConfig;
        }

        if (this.waveConfigs.length === 0) {
            log('[Wavefactory] No standard wave configs available');
            return null;
        }

        const standardIndex = waveIndex % this.waveConfigs.length;
        log(`[Wavefactory] Using config index ${standardIndex} of ${this.waveConfigs.length}`);
        return this.waveConfigs[standardIndex].json as unknown as EnemyConfig;
    }

    private determinePrefab(waveIndex: number, bossStage: boolean): Prefab | null {
        if (bossStage && this.bossPrefabs.length > 0) {
            const index = waveIndex % this.bossPrefabs.length;
            return this.bossPrefabs[index];
        }

        if (this.enemyPrefabs.length === 0) {
            log('[Wavefactory] No enemyPrefabs assigned');
            return null;
        }

        const index = waveIndex % this.enemyPrefabs.length;
        return this.enemyPrefabs[index];
    }

    private generateRadialWave(
        enemyPrefab: Prefab,
        container: Node,
        enemyCount: number,
        spawnRadius: number,
        config: EnemyConfig,
        target: Node,
        wanderPoints: Vec2[]
    ): Enemy[] {
        const spawnedEnemies: Enemy[] = [];
        const angleStep = (Math.PI * 2) / enemyCount;

        for (let i = 0; i < enemyCount; i++) {
            const currentAngle = i * angleStep;
            const spawnX = Math.cos(currentAngle) * spawnRadius;
            const spawnY = Math.sin(currentAngle) * spawnRadius;

            const enemyNode = instantiate(enemyPrefab);
            enemyNode.setParent(container);
            enemyNode.setPosition(spawnX, spawnY);

            const enemyComp = enemyNode.getComponent(Enemy);
            if (!enemyComp) {
                log('[Wavefactory] Enemy prefab missing Enemy component');
                continue;
            }

            enemyComp.init(config, target, wanderPoints);
            spawnedEnemies.push(enemyComp);
        }

        EventBus.emit(GameEvents.WAVE_SPAWNED, spawnedEnemies);
        return spawnedEnemies;
    }
}



