import { Config, Console, Context, Effect, Layer, pipe } from "effect";
import { Booking } from "../booking/type";

export class Email extends Context.Tag('Service/Email')<
    Email,
    {
        sendMail: (booking: Booking) => Effect.Effect<void>
    }
>() {
    /**
     * Here we are showing what a Test implementation would look like
     * compared to a Live implementation shown in other services.
     */
    static Test = Layer.effect(
        Email,
        Config.string('EMAIL_URL').pipe(
            Effect.map((url) => Email.of({
                /**
                 * In the Test impl, sendMail is simply a mock that logs that the booking
                 * mail was sent. This function has access to the booking that was
                 * approved by the server.
                 * 
                 * You would be able to use anything like Nodemailer, SendGrid, Mailgun, etc.
                 * in the actual Live implementation, and provide it with Config.string(...)
                 */
                sendMail: (booking: Booking) => pipe(
                    Console.log(`Sending email for booking ${booking.id} using URL: ${url}`)
                )
            }))
        )
    )

}