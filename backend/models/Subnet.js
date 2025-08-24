var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const subnetSchema  = new Schema({ 

    createdAt: { 
        type: Date, 
        default: Date.now, 
    }, 
    netuid: { 
        type: Number,
        required: true, 
    },
	name: {
		type: String,
		required: true,
	},
    status: { 
        type: String, 
        required: true, 
    }, 
    activevalidator: { 
        type: Number, 
        required: true, 
    }, 
    activeminer: { 
        type: Number, 
        required: true, 
    }, 
    
}); 

StatusHistory = mongoose.model('Subnet', subnetSchema );

module.exports = StatusHistory;