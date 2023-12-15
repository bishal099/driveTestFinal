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

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        default: 'default',
    },
    lastName: {
        type: String,
        default: 'default',
    },
    licenseNo: {
        type: String,
        default: 'default',
        set: (value) => bcrypt.hashSync(value, 10),
    },
    age: {
        type: Number,
        default: 0,
    },
    username: {
        type: String,
        // username unique
        unique: true,
    },
    password: {
        type: String,
        set: (value) => bcrypt.hashSync(value, 10),
    },
    userType: {
        type: String,
        default: 'Driver',
    },
    carDetails: {
        make: {
            type: String,
            default: 'default',
        },
        model: {
            type: String,
            default: 'default',
        },
        year: {
            type: Number,
            default: 0,
        },
        platNo: {
            type: String,
            default: 'default',
        },
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
    },
    gAppointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null,
    },
    testType: {
        type: String,
        default: null,
    },
    comment: {
        type: String,
        default: null,
    },
    isPassed: {
        type: Boolean,
        default: null,
    },
});


const userModel = mongoose.model('User', userSchema);

export default userModel;