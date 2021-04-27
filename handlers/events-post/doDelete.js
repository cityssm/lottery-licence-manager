import deleteEvent from "../../helpers/licencesDB/deleteEvent.js";
export const handler = (req, res) => {
    if (req.body.licenceID === "" || req.body.eventDate === "") {
        return res.json({
            success: false,
            message: "Licence ID or Event Date Unavailable"
        });
    }
    const madeChanges = deleteEvent(req.body.licenceID, req.body.eventDate, req.session);
    if (madeChanges) {
        return res.json({
            success: true,
            message: "Event Deleted"
        });
    }
    res.json({
        success: false,
        message: "Event Not Deleted"
    });
};
export default handler;
