var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const statusSchema = new Schema({ 

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

StatusHistory = mongoose.model('StatusHistory', statusSchema);

module.exports = StatusHistory;