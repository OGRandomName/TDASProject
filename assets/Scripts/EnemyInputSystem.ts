import { _decorator, Component, math, Node, Vec2 } from 'cc';
import { SeekBehavior } from './SeekBehavior';
import { IInputSystem } from './IInputSystem';
import { WanderBehavior } from './WanderBehavior';
const { ccclass, property } = _decorator;

@ccclass('EnemyInputSystem')
export class EnemyInputSystem extends Component implements IInputSystem {
//    private seek: SeekBehavior = new SeekBehavior();
    private wander: WanderBehavior = new WanderBehavior();
//    private targetNode: Node | null = null;

    public initialize(wayPoints: Vec2[]) {
        this.wander.setWayPoints(wayPoints);
    }

    public getMoveDirection(): Vec2 {
   //     if (!this.targetNode) return Vec2.ZERO;

        let currentPos = new Vec2(
            this.node.worldPosition.x, this.node.worldPosition.y
        );
//        const targetPos = new Vec2(
//            this.targetNode.worldPosition.x, this.targetNode.worldPosition.y
//        );
        if (this.wander.hasArrived(currentPos)) {
            (this.wander as any).pickNewWanderPoint();
        }
        return this.wander.getDesiredVelocity(currentPos);
    }

    public getRotationAngle(): number | null {
        return null;
    }
}

