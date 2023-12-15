import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import {} from 'dotenv/config'

export const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('\n**** Connected to MongoDB Successfully !! ****');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB: ', err);
    });

const appointmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    isTimeSlotAvailable: {
        type: Boolean,
        default: true,
    },
});

const appointmentModel = mongoose.model('Appointment', appointmentSchema);

export default appointmentModel;