import { _decorator, Component, find, Node, Vec2 } from 'cc';
import { EnemyInputSystem } from './EnemyInputSystem';
const { ccclass, property } = _decorator;
import { EnemyMovementSystem } from './EnemyMovementSystem';
import { HealthSystem } from './HealthSystem';
@ccclass('Enemy')
export class Enemy extends Component {

    private inputSystem: EnemyInputSystem | null = null
    private movementSystem: EnemyMovementSystem | null = null
    private healthSystem: HealthSystem | null = null
    private targetNode: Node | null = null

    protected onLoad() {
        this.inputSystem = this.getComponent(EnemyInputSystem);
        this.movementSystem = this.getComponent(EnemyMovementSystem);
        this.healthSystem = this.getComponent(HealthSystem);

        if(this.healthSystem) {
            this.healthSystem.initialize(20); // Example max health
        }
//            if (this.inputSystem) {
//                this.targetNode = find("Canvas/Player")
//                this.inputSystem.initialize();
//            }


    }

    start() {
        if (this.inputSystem) {
    //        this.targetNode = find("Canvas/Player")
        let wanderPoints = this.node.getParent().getChildByName("WanderNodes").children.map(
            child => new Vec2(child.worldPosition.x, child.worldPosition.y)
        )
        this.inputSystem.initialize(wanderPoints);
        }
    }

    update(deltaTime: number) {
        if (this.healthSystem) {
            if (this.healthSystem.isDead) {
                this.node.destroy()
            }
        }

        if (this.inputSystem && this.movementSystem) {
            
            let moveDir = this.inputSystem.getMoveDirection()

            this.movementSystem.updateMovement(moveDir);

            let targetAngle = this.inputSystem.getRotationAngle()
            this.movementSystem.updateRotation(targetAngle)
        }
    }
}


