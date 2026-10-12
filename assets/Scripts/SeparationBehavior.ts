import { math, Vec2 } from "cc";
import { EnemyMovementSystem } from "./EnemyMovementSystem";
import { ISteeringBehavior } from "./ISteeringBehavior";

export class SeparationBehavior implements ISteeringBehavior {

    private brain: EnemyMovementSystem
    private separationRadius: number

    constructor(movementSystem: EnemyMovementSystem, separationRadius: number) {
        this.brain = movementSystem
        this.separationRadius = separationRadius
        


    }
    getDesiredVelocity(currentPosition: math.Vec2, targetPosition?: Readonly<math.Vec2>): math.Vec2 {
        let neigbors = this.brain.getNeighbors()
        let separationForce = new Vec2

        if (neigbors.length <= 0) return separationForce

        let pushCount = 0


        for (let neighbor of neigbors) {
            let distance = Vec2.distance(currentPosition, neighbor)

            if (distance < this.separationRadius) {
                let pushVector = new Vec2

                if (distance === 0) {
                    pushVector.set(math.randomRange(-0.1, 0.1), math.randomRange(-0.1, 0.1))
                }
                else {
                    Vec2.subtract(pushVector, currentPosition, neighbor)
                    pushVector.normalize()
                    let strength = 1.0 - (distance / this.separationRadius)
                    pushVector.multiplyScalar(strength)
                }
                separationForce.add(pushVector)
                pushCount++

            }

            if (pushCount > 0) {
                separationForce.multiplyScalar(1.0 / pushCount)
            }
            return separationForce

        }

        
    }


}


