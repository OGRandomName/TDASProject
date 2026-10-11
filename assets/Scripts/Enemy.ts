import { _decorator, Component, find, Node, Vec2 } from 'cc';
import { EnemyInputSystem } from './EnemyInputSystem';
const { ccclass, property } = _decorator;
import { EnemyMovementSystem } from './EnemyMovementSystem';
import { HealthSystem } from './HealthSystem';
import { IntentConfig } from './EnemyConfig';
@ccclass('Enemy')
export class Enemy extends Component {

    @property({ group: 'Intent Weights', slide: true, range: [0, 5, 0.1] })
    public seekWeight: number = 1

    @property({ group: 'Intent Weights', slide: true, range: [0, 5, 0.1] })
    public fleeWeight: number = 0.0

    private inputSystem: EnemyInputSystem | null = null
    private movementSystem: EnemyMovementSystem | null = null
    private healthSystem: HealthSystem | null = null
    private targetNode: Node | null = null
    private intentConfig: IntentConfig

    protected onLoad() {
        this.inputSystem = this.getComponent(EnemyInputSystem);
        this.movementSystem = this.getComponent(EnemyMovementSystem);
        this.healthSystem = this.getComponent(HealthSystem);

        if(this.healthSystem) {
            this.healthSystem.initialize(20); // Example max health
        }
        this.intentConfig = {
            seekWeight: this.seekWeight,
            fleeWeight: this.fleeWeight
        };
    }

    start() {
        if (this.inputSystem) {
        this.targetNode = find("Canvas/Player")
        let wanderPoints = this.node.getParent().getChildByName("WanderNodes").children.map(
            child => new Vec2(child.worldPosition.x, child.worldPosition.y)
        )
        this.inputSystem.initialize(this.targetNode, wanderPoints, this.intentConfig);
        }
    }

    update(deltaTime: number) {
        if (this.healthSystem) {
            if (this.healthSystem.isDead) {
                this.node.destroy()
            }
        }

        if (this.inputSystem && this.movementSystem) {

            let isSlow = this.movementSystem.isMovingSlowly()
            this.inputSystem.isMovingSlowly = isSlow

            this.inputSystem.processFSM(deltaTime)
            
            let moveDir = this.inputSystem.getMoveDirection()

            this.movementSystem.updateMovement(moveDir);

            let targetAngle = this.inputSystem.getRotationAngle()
            this.movementSystem.updateRotation(targetAngle)
        }

        if (this.inputSystem.stateDebugLabel) {
            this.inputSystem.stateDebugLabel.node.angle = -this.node.angle;
        }
    }
}


