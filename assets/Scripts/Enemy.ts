import { _decorator, Component, find, log, Node, Vec2 } from 'cc';
import { EnemyInputSystem } from './EnemyInputSystem';
import { EnemyMovementSystem } from './EnemyMovementSystem';
import { HealthSystem } from './HealthSystem';
import { EnemyConfig } from './EnemyConfig';
import { EventBus, GameEvents } from './EventBus';

const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {

    private inputSystem: EnemyInputSystem | null = null;
    private movementSystem: EnemyMovementSystem | null = null;
    private healthSystem: HealthSystem | null = null;

    private configLoaded = false;

    protected onLoad() {
        this.inputSystem = this.getComponent(EnemyInputSystem);
        this.movementSystem = this.getComponent(EnemyMovementSystem);
        this.healthSystem = this.getComponent(HealthSystem);
    }

    // SINGLE init path: called only by Wavefactory
    public init(enemyConfig: EnemyConfig, providedTarget?: Node, providedWanderPoints?: Vec2[]) {
        if (!enemyConfig) {
            log('[Enemy] init called with null config');
            return;
        }

        this.configLoaded = true;

        this.node.setScale(enemyConfig.scale.x, enemyConfig.scale.y, 1);

        if (this.healthSystem) {
            this.healthSystem.initialize(enemyConfig.health);
        }

        const targetNode = providedTarget || find('Canvas/Player');
        let wanderPoints = providedWanderPoints;

        if (!wanderPoints || wanderPoints.length === 0) {
            const parent = this.node.parent;
            const wanderRoot = parent?.getChildByName('WanderNodes');
            if (wanderRoot) {
                wanderPoints = wanderRoot.children.map(
                    child => new Vec2(child.worldPosition.x, child.worldPosition.y)
                );
            } else {
                wanderPoints = [];
            }
        }

        if (this.inputSystem) {
            this.inputSystem.initialize(targetNode, wanderPoints, enemyConfig.intent);
        }

        if (this.movementSystem) {
            this.movementSystem.init(enemyConfig.intent.maxSpeed, enemyConfig.moving);
        }
    }

    update(deltaTime: number) {
        if (!this.configLoaded) return;

        if (this.healthSystem && this.healthSystem.isDead) {
            this.node.destroy();
            return;
        }

        if (this.inputSystem && this.movementSystem) {
            const isSlow = this.movementSystem.isMovingSlowly();
            this.inputSystem.isMovingSlowly = isSlow;

            this.inputSystem.processFSM(deltaTime);

            const moveDir = this.inputSystem.getMoveDirection();
            this.movementSystem.updateMovement(moveDir);

            const targetAngle = this.inputSystem.getRotationAngle();
            this.movementSystem.updateRotation(targetAngle);
        }

        if (this.inputSystem?.stateDebugLabel) {
            this.inputSystem.stateDebugLabel.node.angle = -this.node.angle;
        }
    }

    protected onDestroy() {
        EventBus.emit(GameEvents.ENEMY_DIED, this);
    }
}
