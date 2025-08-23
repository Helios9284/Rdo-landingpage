var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const subnetSchema  = new Schema({ 

    createdAt: { 
        type: Date, 
        default: Date.now, 
    }, 
    netuid: { 
        type: String,
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
    
}); 

StatusHistory = mongoose.model('Subnet', subnetSchema );

module.exports = StatusHistory;