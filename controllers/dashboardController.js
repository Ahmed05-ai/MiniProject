/**
 * Dashboard Controller
 * Returns dynamic, computed metrics from authoritative database
 */

const DashboardService = require('../services/dashboardService');

class DashboardController {
    /**
     * GET /api/dashboard/student/:id
     */
    static async getStudentDashboard(req, res) {
        try {
            const data = await DashboardService.getStudentDashboard(req.params.id);
            res.json({ success: true, ...data });
        } catch (err) {
            console.error('Error fetching student dashboard:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * GET /api/dashboard/admin
     */
    static async getAdminDashboard(req, res) {
        try {
            const data = await DashboardService.getAdminDashboard();
            res.json({ success: true, ...data });
        } catch (err) {
            console.error('Error fetching admin dashboard:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = DashboardController;
