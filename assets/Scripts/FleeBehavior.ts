import { Vec2} from "cc"
import { ISteeringBehavior } from "./ISteeringBehavior"

export class FleeBehavior implements ISteeringBehavior {
    getDesiredVelocity(currentPosition: Vec2, targetPosition?: Readonly<Vec2>): Vec2 {
        let desiredDir = new Vec2
        Vec2.subtract(desiredDir, currentPosition, targetPosition)
        return desiredDir.normalize()
    }
}
