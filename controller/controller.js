import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

class Controller {
    static testGet = (req, res) => {
        res.end(`<h1 style='text-align: center; color:red;'>Welcome to Home Page</h1> </br> 
        <p style = 'text-align: center; font-size:90%;' > DriveTest Dashboard is rendered in <a href = "/dashboard" > /dashboard </a> path </p>`)
    };

    static getHomepage = (req, res) => {
        res.render('home');
    };

    static getDashboard = async (req, res) => {
        const userId = req.session.user_id;

        const user = await userModel.findById(userId).exec();

        res.render('dashboard', {
            user
        });

    };

    static getAdminDashboard = async (req, res) => {
        const userName = req.session.user_UserName;

        const candidateLists = await userModel.find({
            userType: 'Driver',
            comment: {
                $ne: null
            },
            isPassed: {
                $ne: null
            },
        });

        res.render('admin_dashboard', {
            candidateLists: candidateLists
        });
    };

    static postSignUp = async (req, res) => {

        try {
            const {
                username,
                password,
                repeatedPassword,
                userType
            } = req.body;

            if (!username || !password || !repeatedPassword || !userType) {
                return res.render('login', {
                    message: 'Please fill all required fields for registration',
                });
            }
            // Check if username already exists
            const existingUser = await userModel.findOne({
                username
            }).exec();

            if (existingUser) {
                return res.render('login', {
                    message: 'Username already exists. Choose a different username.',
                });
            }

            // Password validation one uppercase, symbol, number and 8 digit long
            const isPasswordValid = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/.test(password);

            if (!isPasswordValid) {
                return res.render('login', {
                    message: 'Password must have at least one uppercase letter, one symbol, and one number. It should be at least 8 characters long.',
                });
            }

            if (password !== repeatedPassword) {
                return res.render('login', {
                    message: 'Passwords do not match'
                });
            }

            const userToAdd = new userModel({
                username,
                password,
                userType,
            });

            const userSaved = await userToAdd.save();

            res.render('login', {
                message: 'Signup successful! Please log in.'
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error adding user");
        }
    }

    static getLoginSignupPage = (req, res) => {
        res.render('login', {
            message: "",

        });
    };

    static postLogin = async (req, res) => {
        try {
            const {
                username,
                password
            } = req.body;

            if (!username || !password) {
                return res.render('login', {
                    message: 'Please enter username and password for login.',
                });
            }

            const user = await userModel.findOne({
                username
            }).exec();


            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.render('login', {
                    message: 'Invalid username or password'
                });
            }
            // Set user_id and user_UserType in session
            req.session.user_id = user._id;
            req.session.user_UserName = user.username;
            req.session.user_UserType = user.userType;

            if (user.userType === 'Examiner') {
                return res.redirect('/examiner_dashboard');
            }
            if (user.userType === 'Admin') {
                return res.redirect('/appointment');
            }

            // Check if the user is logging in first time
            const isFirstLogin = user.firstName === 'default' && user.lastName === 'default' && user.age === 0;

            if (isFirstLogin) {

                res.render('g2_page', {
                    user: null,
                    g2Data: null,
                    message: `Welcome ${username} !! Please fill your required details`,
                });


            } else {
                // Redirect to dashboard
                res.redirect('/dashboard');
            }

        } catch (error) {
            console.error(error);
            res.status(500).send('Error during login');
        }
    }

    static getG2Page = async (req, res) => {

        try {
            // Check existing G2 data for the logged-in user
            const userId = req.session.user_id;

            const g2Data = await userModel.findOne({
                _id: userId
            }).exec();

            console.log(g2Data);

            const isFirstLogin = g2Data.firstName === 'default' && g2Data.lastName === 'default' && g2Data.age === 0;

            if (isFirstLogin) {

                res.render('g2_page', {
                    user: null,
                    g2Data: null,
                    message: `Please fill your required details`,
                });


            } else {
                // Check if the user has booked an appointment
                if (g2Data.appointmentId) {
                    // Fetch the appointment details
                    const appointmentDetails = await appointmentModel.findById(g2Data.appointmentId).exec();

                    // Attach appointment details to the g2Data object
                    g2Data.appointmentDetails = appointmentDetails;
                }

                res.render('g2_page', {
                    user: null,
                    g2Data: g2Data,
                    message: '',
                });
            }

        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching G2 data');
        }

    }


    static postG2Page = async (req, res) => {
        try {
            const formData = req.body;

            // Check if the user is logged in (session has user_id)
            if (!req.session.user_id) {
                return res.redirect('/login');
            }
            // Find user by user_id from the session
            const userToUpdate = await userModel.findById(req.session.user_id).exec();

            if (!userToUpdate) {
                return res.render('g2_page', {
                    message: 'User not found'
                });
            }

            // Validate empty fields
            if (!formData.firstName || !formData.lastName || !formData.licenseNumber || !formData.age ||
                !formData.carMake || !formData.carModel || !formData.carYear || !formData.platNo) {
                // Save the form data in the session
                req.session.formData = formData;

                return res.render('g2_page', {
                    message: 'Please fill all required fields',
                    g2Data: null,
                });
            }

            // License number validation as 8 characters alphanumeric
            if (!/^[a-zA-Z0-9]{8}$/.test(formData.licenseNumber)) {
                // Save form data in the session
                req.session.formData = formData;

                return res.render('g2_page', {
                    message: 'License number must be 8 characters (alpha numeric).',
                    g2Data: null,
                });
            }

            const appointmentDate = formData.appointmentDate;
            const appointmentTime = formData.appointmentTime;

            // find the appointment object id from these two values
            const appointment = await appointmentModel.findOne({
                date: appointmentDate,
                time: appointmentTime
            }).exec();

            if (!appointment || !appointment.isTimeSlotAvailable) {
                return res.render('g2_page', {
                    message: 'Invalid or booked time slot. Please choose a different time.',
                    g2Data: null,
                });
            }

            // Update user info based on form data
            userToUpdate.firstName = formData.firstName;
            userToUpdate.lastName = formData.lastName;
            userToUpdate.licenseNo = formData.licenseNumber;
            userToUpdate.age = formData.age;
            userToUpdate.carDetails = {
                make: formData.carMake,
                model: formData.carModel,
                year: formData.carYear,
                platNo: formData.platNo,
            };
            userToUpdate.testType = formData.testType;

            // Save the updated user
            const updatedG2Data = await userToUpdate.save();

            // Update appointment record
            appointment.isTimeSlotAvailable = false;
            await appointment.save();

            // Update user with the appointment ID
            userToUpdate.appointmentId = appointment._id;
            await userToUpdate.save();

            // for displayAppointmentDetails after g2 form submission
            // Attach appointment details to the updatedG2Data object
            const appointmentDetails = await appointmentModel.findById(userToUpdate.appointmentId).exec();
            updatedG2Data.appointmentDetails = appointmentDetails;

            // Clear form data from the session
            delete req.session.formData;

            res.render('g2_page', {
                message: 'Data Updated Successfully!!',
                g2Data: updatedG2Data
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error adding user");
        }
    }

    static getGPage = async (req, res) => {
        try {
            // Check if the user is logged in (session has user_id)
            if (!req.session.user_id) {
                return res.redirect('/login'); // Redirect to login page if not logged in
            }

            // Find the user by user_id from the session
            const user = await userModel.findById(req.session.user_id).exec();


            if (!user) {
                return res.render('g_page', {
                    message: 'Users detail not found',
                    showBackButton: true,
                    user: null
                });
            }

            // Check if user data is still default
            const isDefaultUser = user.firstName === 'default' &&
                user.lastName === 'default' && user.age === 0;

            if (isDefaultUser) {
                return res.render('g2_page', {
                    user: null,
                    g2Data: null,
                    message: "Please fill the G2 Detail first to access the G Page",
                });
            }

            const appointmentDetails = await appointmentModel.findById(user.gAppointmentId).exec();
            user.appointmentDetails = appointmentDetails;

            res.render('g_page', {
                user: user,
                showBackButton: false
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('Error updating user data');
        }
    }

    static postGPage = async (req, res) => {
        const {
            carMake,
            carModel,
            carYear,
            platNo,
            appointmentDate,
            appointmentTime,
            testType
        } = req.body;

        const userId = req.session.user_id;

        try {
            // Find the user by user id
            const userToUpdate = await userModel.findById(userId).exec();
            console.log(userToUpdate, 'userToUpdate');

            // find the appointment object id from these two values
            const appointment = await appointmentModel.findOne({
                date: appointmentDate,
                time: appointmentTime
            }).exec();

            console.log(appointment);

            if (!appointment || !appointment.isTimeSlotAvailable) {
                return res.render('g_page', {
                    message: 'Invalid or booked time slot. Please choose a different time.',
                    showBackButton: true,
                    user: null,
                });
            }

            if (!userToUpdate) {
                res.render('g_page', {
                    message: 'User Details not found.',
                    showBackButton: true,
                    user: null,
                });
            } else {
                // Update appointment record
                userToUpdate.gAppointmentId = appointment._id;
                userToUpdate.testType = testType;
                // Update the car information
                userToUpdate.carDetails.make = carMake;
                userToUpdate.carDetails.model = carModel;
                userToUpdate.carDetails.year = carYear;
                userToUpdate.carDetails.platNo = platNo;
                // Save the updated user
                await userToUpdate.save();

                // Update appointment record
                appointment.isTimeSlotAvailable = false;
                await appointment.save();

                // for displayAppointmentDetails after g2 form submission
                // Attach appointment details to the updatedG2Data object
                const appointmentDetails = await appointmentModel.findById(userToUpdate.gAppointmentId).exec();
                userToUpdate.appointmentDetails = appointmentDetails;

                // Redirect to 'g_page' with a success message
                res.render('g_page', {
                    user: userToUpdate,
                    message: 'Car Information Updated',
                    showBackButton: true,
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error updating user data');
        }
    }

    static logout = (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error destroying session');
            } else {
                res.redirect("/login");
            }
        });
    };



    static getAppointmentPage = async (req, res) => {
        res.render('appointment', {
            message: '',
        });
    }

    static postAppointmentPage = async (req, res) => {
        try {
            const {
                date,
                time
            } = req.body;

            const existingSlot = await appointmentModel.findOne({
                date,
                time
            }).exec();

            if (existingSlot) {
                return res.render('appointment', {
                    message: 'Time slot already exists. Please choose a different time.',
                });
            }

            const newAppointment = new appointmentModel({
                date,
                time,
                isTimeSlotAvailable: true
            });
            await newAppointment.save();

            res.render('appointment', {
                message: 'Appointment slot added successfully for ' + date + ' at ' + time + '.',
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error adding appointment slots');
        }
    }

    static getAvailableSlots = async (req, res) => {
        try {
            const selectedDate = req.query.date;

            // Fetch all booked slots for the selected date
            const bookedSlots = await appointmentModel.find({
                date: selectedDate
            }).exec();

            // Define the available slots from 9 am to 2:30 pm
            const availableSlots = [];
            for (let i = 9; i <= 14; i++) {
                const hourValue = i > 12 ? i - 12 : i;
                const ampm = i >= 12 ? 'pm' : 'am';
                const fullHourValue = `${hourValue}:00 ${ampm}`;
                const halfHourValue = `${hourValue}:30 ${ampm}`;

                const isFullHourBooked = bookedSlots.some(slot => slot.time === fullHourValue);

                // Push the slot information to the availableSlots array
                availableSlots.push({
                    value: fullHourValue,
                    display: fullHourValue,
                    disabled: isFullHourBooked
                });

                const isHalfHourBooked = bookedSlots.some(slot => slot.time === halfHourValue);

                availableSlots.push({
                    value: halfHourValue,
                    display: halfHourValue,
                    disabled: isHalfHourBooked
                });
            }

            res.json({
                availableSlots
            });
        } catch (error) {
            console.error("Error fetching available slots:", error);
            res.status(500).json({
                error: "Internal Server Error"
            });
        }
    };

    static getAvailableSlotsForDriver = async (req, res) => {
        try {
            const selectedDate = req.query.date;

            const availableSlots = await appointmentModel.find({
                date: selectedDate,
                isTimeSlotAvailable: true,
            }).exec();

            res.json({
                availableSlots
            });
        } catch (error) {
            console.error('Error fetching available slots for driver:', error);
            res.status(500).json({
                error: 'Internal Server Error'
            });
        }
    };

    // controller.js

    static getExaminerDashboard = async (req, res) => {
        try {
            // Check if the user is logged in (session has user_id)
            if (!req.session.user_id || req.session.user_UserType !== 'Examiner') {
                return res.redirect('/login');
            }

            // Fetch users based on TestType (G2 or G)
            const testType = req.query.testType || 'All';
            // Default to 'All' if not specified
            let users;
            if (testType === 'All') {
                users = await userModel.find({
                    testType: {
                        $in: ['G2', 'G']
                    },
                }).exec();
            } else {
                users = await userModel.find({
                    testType,
                }).exec();
            }

            res.render('examiner_dashboard', {
                users,
                testType,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching Examiner dashboard data');
        }
    };


    // controller.js

    static getExaminerPage = async (req, res) => {
        try {
            // Check if the user is logged in (session has user_id)
            if (!req.session.user_id || req.session.user_UserType !== 'Examiner') {
                return res.redirect('/login');
            }

            // Fetch user details
            const userId = req.query.userId;
            const user = await userModel.findById(userId).exec();

            console.log(user);
            res.render('examiner_page', {
                user,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching Examiner page data');
        }
    };

    static postExaminerPage = async (req, res) => {
        try {
            // Check if the user is logged in (session has user_id)
            if (!req.session.user_id || req.session.user_UserType !== 'Examiner') {
                return res.redirect('/login');
            }

            const {
                userId,
                comment,
                isPassed,
                testType
            } = req.body;

            console.log(userId, comment, isPassed, testType);

            // Update user details
            const userToUpdate = await userModel.findById(userId).exec();
            userToUpdate.comment = comment;
            userToUpdate.isPassed = isPassed;
            userToUpdate.testType = testType;
            await userToUpdate.save();

            // Redirect to Examiner dashboard with a success message
            res.redirect('/examiner_dashboard?testType=' + testType);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error updating Examiner page data');
        }
    };


}

export default Controller;