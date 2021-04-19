import { deleteEvent } from "../../helpers/licencesDB/deleteEvent.js";
export const handler = (req, res) => {
    if (req.body.licenceID === "" || req.body.eventDate === "") {
        res.json({
            success: false,
            message: "Licence ID or Event Date Unavailable"
        });
    }
    else {
        const changeCount = deleteEvent(req.body.licenceID, req.body.eventDate, req.session);
        if (changeCount) {
            res.json({
                success: true,
                message: "Event Deleted"
            });
        }
        else {
            res.json({
                success: false,
                message: "Event Not Deleted"
            });
        }
    }
};
