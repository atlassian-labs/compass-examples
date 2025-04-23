(function executeRule(current, previous /*null when async*/) {
    var responseBody;
    var status;
    var sm;

    try {
        // The name of your Outbound REST Message and Method must match exactly
        sm = new sn_ws.RESTMessageV2('Compass Incident Webhook', 'Default POST');

        // Set timeout of 10 seconds
        sm.setHttpTimeout(10000);

        // Build request body
        sm.setStringParameter("severity", current.priority);
        sm.setStringParameter("severityLabel", current.priority.getDisplayValue());
        sm.setStringParameter("state", current.state.getDisplayValue());

        // You must create a mapping of this service name to a Compass Component in the Custom Webhooks App
        sm.setStringParameter("serviceName", current.business_service.name);

        sm.setStringParameter("incidentId", current.sys_id);
        sm.setStringParameter("incidentName", current.short_description);
        sm.setStringParameter("incidentDescription", current.description);

        var url = 'https://' + gs.getProperty('instance_name') + '.service-now.com/' + current.getTableName() + '?sys_id=' + current.sys_id;
        sm.setStringParameter("url", url);

        // Convert datetimes from ServiceNow
        // See: https://www.servicenow.com/community/service-management-forum/how-to-convert-servicenow-ticket-created-date-in-to-iso-8601/m-p/390683
        var original = current.opened_at.toString();
        var dt = original.split(' ');
        var f = dt[0].split('-');
        var t = dt[1].split(':');
        var event = new Date(f[0], f[1]-1, f[2], t[0], t[1], t[2]);

        var startTime = event.toISOString();
        sm.setStringParameter("startTime", startTime);

        if (current.resolved_at || current.closed_at) {
            var endDate = current.resolved_at || current.closed_at;
            var originalEnd = endDate.toString();
            var endDt = originalEnd.split(' ');
            var endF = endDt[0].split('-');
            var endT = endDt[1].split(':');
            var closedEvent = new Date(endF[0], endF[1]-1, endF[2], endT[0], endT[1], endT[2]);

            var endTime = closedEvent.toISOString();
            sm.setStringParameter("endTime", endTime);
        } else {
            sm.setStringParameter("endTime", "");
        }

        // Send request
        response = sm.execute();
        responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
        status = response.getStatusCode();
    } catch(ex) {
        responseBody = ex.getMessage();
        status = '500';
    }

})(current, previous);