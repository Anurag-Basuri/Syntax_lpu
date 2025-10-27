import mongoose from "mongoose"
import validator from "validator";
import { v4 as uuidv4 } from "uuid";
import { type } from "os";

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        default: uuidv4,
        unique: true
    },

    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Invalid email format'
        }
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                // Remove leading 0 or +91 if present
                const normalized = v.replace(/^(\+91|0)/, '');
                return /^\d{10}$/.test(normalized);
            },
            message: 'Phone number must be 10 digits (ignore leading 0 or +91)'
        }
    },
    lpuId: {
        type: Number,
        required: [true, 'LPU ID is required'],
        unique: true,
        validate: {
            validator: function(v) {
                return /^\d{8}$/.test(v);
            },
            message: 'LPU ID must be 8 digits'
        }
    },
    gender:{
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female']
    },
    hosteler: {
        type: Boolean,
        required: [true, 'Hosteler status is required'],
        default: false
    },
    hostel: {
        type: String,
        required: function() {
            return this.hosteler; // Only required if hosteler is true
        }
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
    },
    club: {
        type:String,
    },

    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    },
    eventName: {
        type: mongoose.Schema.Types.String,
        required: true,
        trim: true,
        ref: 'Event'
    },
    isUsed: {
        type: Boolean,
        default: false,
        required: true
    },

    qrCode: {
        url: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^https?:\/\/.*\.(png|jpg|jpeg)$/.test(v);
                },
                message: 'QR Code must be a valid image URL'
            },
            publicId: {
                type: String,
                unique: true
            }
        }
    },

    isCancelled: {
        type: Boolean,
        default: false,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    emailFailed: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

ticketSchema.index({ eventId: 1, createdAt: -1 });
ticketSchema.pre('save', function(next) {
    if (this.isModified('email') && !validator.isEmail(this.email)) {
        return next(new Error('Invalid email format'));
    }
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
