import { math, Vec2 } from "cc";
import { ISteeringBehavior } from "./ISteeringBehavior";
import { IntentConfig } from "./EnemyConfig";
import { SeekBehavior } from "./SeekBehavior";
import { FleeBehavior } from "./FleeBehavior";
import { PursuitBehavior } from "./PursuitBehavior";

export class IntentSteeringBehavior implements ISteeringBehavior {
  
  private intent: IntentConfig
  private seekBehavior: SeekBehavior = new SeekBehavior();
  private fleeBehavior: FleeBehavior = new FleeBehavior();
  private pursuitBehavior: PursuitBehavior  
  
  public setWeights(steering: IntentConfig) {
    this.intent = steering
    this.pursuitBehavior = new PursuitBehavior(steering.maxSpeed, steering.maxPredictionTime);
  }
  
    getDesiredVelocity(currentPosition: math.Vec2, targetPosition?: Readonly<math.Vec2>, targetVelocity?: Readonly<math.Vec2>): math.Vec2 {
        let totalSteeringForce = new Vec2

        if (!targetPosition) return totalSteeringForce

        if(this.intent.seekWeight > 0 && targetPosition) {
            let seekForce = this.pursuitBehavior.getDesiredVelocity(currentPosition, targetPosition, targetVelocity)
            seekForce.multiplyScalar(this.intent.seekWeight)
            totalSteeringForce.add(seekForce)
        }

        if(this.intent.fleeWeight > 0 && targetPosition) {
            let fleeForce = this.fleeBehavior.getDesiredVelocity(currentPosition, targetPosition)
            fleeForce.multiplyScalar(this.intent.fleeWeight)
            totalSteeringForce.add(fleeForce)
        }

        if (totalSteeringForce.lengthSqr() > 1.0) {
            totalSteeringForce.normalize()
        }

        return totalSteeringForce
    }

}
