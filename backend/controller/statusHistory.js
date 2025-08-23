
const ChangedHistory = require("../models/changedHistory");
const StatusHistory = require("../models/Subnet");

exports.saveStatusHistory = async (req, res) =>{
    try{
        const data = req.body.snapshot;
        data.forEach( async (element) => {
            const { netuid, name, status } = element;
            const existingStatus = await StatusHistory.findOne({ netuid: netuid });
            if(existingStatus){
                if(existingStatus.status !== status || existingStatus.name !== name){
                    const historyEntry = new ChangedHistory({
                        netuid: netuid,
                        oldname: existingStatus.name,
                        newname: name,
                        oldstatus: existingStatus.status,
                        newstatus: status
                    });
                    await historyEntry.save();
                    existingStatus.name = name;
                    existingStatus.status = status;
                    await existingStatus.save();
                }
            } else {
                const newStatus = new StatusHistory({
                    netuid: netuid,
                    name: name,
                    status: status
                });
                await newStatus.save();
            }
        });
        
    } catch(error){
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: 'Server Error' });
    }

}
