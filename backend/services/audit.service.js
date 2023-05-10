const db = require("./db.service");
const { PreparedStatement: PS } = require("pg-promise");

async function create(audit, user) {
  const insertAudit = new PS({
    name: "insert-audit",
    text: 'Insert into "DSS".tbl_audit_data(user_id, action_performed, action_timestamp, ip_address, user_agent, additional_details) Values($1,$2,$3,$4, $5, $6) ',
    values: [
      user._id,
      audit.action,
      "now()",
      user.ipAddress,
      user.userAgent,
      audit.additionalDetails,
    ],
  });

  const result = await db.callQuery(insertAudit);

  return result;
}

module.exports = {
  create,
};
