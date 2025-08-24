

const ChangedHistory = require("../models/changedhistories");
const StatusHistory = require("../models/Subnet");

const compareStatuses = (currentSnapshots, previousSnapshots) => {
  const changes = [];
  const previousMap = new Map(previousSnapshots.map(s => [s.netuid, s]));

  currentSnapshots.forEach(current => {
    const previous = previousMap.get(current.netuid);
    if (previous && previous.status !== current.status) {
      changes.push({
        id: `${current.netuid}-${Date.now()}`,
        netuid: current.netuid,
        subnetName: current.name,
        oldName: previous.name,
        newName: current.name,
        oldStatus: previous.status,
        newStatus: current.status,
        timestamp: new Date()
      });
    }
  });

  return changes;
};

exports.saveStatusHistory = async (req, res) =>{
    try{
        const data = req.body.snapshot;

        const previousSnapshots = await StatusHistory.find({})
            .sort({ createdAt: -1 })
            .limit(data.length);
        if (!previousSnapshots) {
            console.log("No previous snapshots found, saving initial data.");
            data.forEach(async (element) => {
                const { netuid, name, status, activeMiners, activeValidators } = element;
                const newStatus = new StatusHistory({
                    netuid: netuid,
                    name: name,
                    status: status,
                    activevalidator: activeValidators,
                    activeminer: activeMiners
                });
                await newStatus.save();
            });
            return res.status(200).json({
                success: true, 
                message: 'Initial status history saved successfully',
            })
        } else if (previousSnapshots) {
            const changes = compareStatuses(data, previousSnapshots);
            if (changes.length > 0) {
                for (const change of changes) {
                    const data = {
                        netuid: change.netuid,
                        oldname: change.oldName,
                        newname: change.newName,
                        oldstatus: change.oldStatus,
                        newstatus: change.newStatus}
                    const historyEntry = new ChangedHistory(data);
                    const savedEntry = await historyEntry.save();
                    console.log("Successfully saved:", savedEntry);
                }
                data.forEach(async (element) => {
                    const { netuid, name, status, activeMiners, activeValidators } = element;
                    const existingStatus = await StatusHistory.findOne({ netuid: netuid });
                    if (existingStatus) {
                        existingStatus.name = name;
                        existingStatus.status = status;
                        existingStatus.activevalidator = activeValidators;
                        existingStatus.activeminer = activeMiners;
                        await existingStatus.save();
                    } else {
                        const newStatus = new StatusHistory({
                            netuid: netuid,
                            name: name,
                            status: status,
                            activevalidator: activeValidators,
                            activeminer: activeMiners
                        });
                        await newStatus.save();
                    }
                });
                return res.status(200).json({ 
                    success: true, 
                    message: 'Status changes detected and saved', 
                    changes: changes });
            } else {
                return res.status(200).json({ 
                    success: true, 
                    message: 'No status changes detected' });
            }
        }

    }catch(error){
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: 'Server Error' });
    }
}



exports.getStatusHistory = async (req, res) => {
    try{
        const history = await StatusHistory.find().sort({ timestamp: -1 });
        if(!history){
            return res.status(404).json({ 
                success: false, 
                message: 'No history found' });
        }
        return res.status(200).json({ 
            success: true, 
            data: history });
    } catch(error){
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: 'Server Error' });
    }
}

exports.checkStatusChanges = async (req, res) => {
    try{
        const data = req.body.snapshot;
        console.log("Received snapshot for change check:", data);
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
        console.log("Error checking for changes:", error);
    }
}
