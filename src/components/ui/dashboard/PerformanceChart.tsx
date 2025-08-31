import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Shift } from "@/lib/types/dashboard";
import { Employee } from "@/lib/types/employee";

interface PerformanceChartProps {
  employees: Employee[];
  shifts: Shift[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  employees,
  shifts,
}) => {
  const employeePerformanceData = useMemo(() => {
    const validEmployees = employees.filter((emp) => emp?.id);

    return validEmployees.slice(0, 5).map((emp) => {
      const firstName = emp?.user?.first_name || "Unknown";
      const lastName = emp?.user?.last_name || "Employee";

      const empShifts = shifts.filter((shift) => {
        return (
          shift?.employeeShifts?.some((es) => es?.employee?.id === emp.id) ??
          false
        );
      });

      const completedShifts = empShifts.filter(
        (s) => s?.status === "completed"
      ).length;
      const missedShifts = empShifts.filter(
        (s) => s?.status === "missed"
      ).length;
      const totalShifts = empShifts.length;

      return {
        name: `${firstName} ${lastName}`,
        completed: completedShifts,
        missed: missedShifts,
        rating:
          totalShifts > 0
            ? Math.min(5, Math.max(1, (completedShifts / totalShifts) * 5))
            : 0,
      };
    });
  }, [employees, shifts]);

  const teamAverage = Math.round(
    employeePerformanceData.reduce((sum, emp) => sum + emp.completed, 0) /
      (employeePerformanceData.length || 1)
  );

  const completionRate = Math.round(
    (employeePerformanceData.reduce((sum, emp) => sum + emp.completed, 0) /
      (employeePerformanceData.reduce(
        (sum, emp) => sum + emp.completed + emp.missed,
        0
      ) || 1)) *
      100
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[300px] w-full">
      {/* Chart Area */}
      <div className="lg:w-[70%] h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={employeePerformanceData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barSize={24}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f5f5f5"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{
                fill: "#334155",
                fontSize: 12,
                fontWeight: 500,
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255, 255, 255, 0.96)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                fontSize: "13px",
              }}
              formatter={(value, name) => [
                <span className="font-semibold">{value} shifts</span>,
                <span
                  className={
                    name === "completed"
                      ? "text-green-600"
                      : "text-amber-600"
                  }
                >
                  {name === "completed" ? "Completed" : "Missed"}
                </span>,
              ]}
            />
            <Legend />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#10b981"
              radius={[0, 6, 6, 0]}
              animationBegin={100}
              animationDuration={800}
            />
            <Bar
              dataKey="missed"
              name="Missed"
              fill="#f59e0b"
              radius={[0, 6, 6, 0]}
              animationBegin={300}
              animationDuration={800}
            />
            <ReferenceLine
              x={teamAverage}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                position: "right",
                value: "Team Avg",
                fill: "#64748b",
                fontSize: 11,
                fontWeight: 500,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics Sidebar */}
      <div className="lg:w-[30%] flex flex-col justify-between space-y-4 p-4 bg-gray-100 rounded-lg">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Top Performer</h3>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-medium text-lg">
                {employeePerformanceData[0]?.name.charAt(0) || "?"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {employeePerformanceData[0]?.name.split(" ")[0] || "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                {employeePerformanceData[0]?.completed || 0} completed shifts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-xs">
            <p className="text-xs font-medium text-gray-500">Team Average</p>
            <p className="text-xl font-bold text-gray-900">
              {teamAverage}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-xs">
            <p className="text-xs font-medium text-gray-500">Completion Rate</p>
            <p className="text-xl font-bold text-gray-900">
              {completionRate}%
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Shift Completion</h3>
          <div className="space-y-1">
            {employeePerformanceData.slice(0, 3).map((emp, index) => (
              <div
                key={index}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-gray-700 truncate max-w-[120px]">
                  {emp.name.split(" ")[0]}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {emp.completed}
                  </span>
                  <span className="text-xs text-gray-400">/</span>
                  <span className="text-xs text-gray-500">
                    {emp.completed + emp.missed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};




// import React, { useMemo } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ReferenceLine,
//   ResponsiveContainer,
// } from "recharts";
// import { Shift } from "@/lib/types/dashboard";
// import { Employee } from "@/lib/types/employee";

// interface PerformanceChartProps {
//   employees: Employee[];
//   shifts: Shift[];
//   maxEmployees?: number;
// }

// interface EmployeePerformance {
//   id: number;
//   firstName: string;
//   lastName: string;
//   name: string;
//   completed: number;
//   missed: number;
//   total: number;
//   completionPercentage: number;
//   rating: number;
// }

// interface PerformanceData {
//   employeePerformanceData: EmployeePerformance[];
//   teamAverage: number;
//   completionRate: number;
//   topPerformer: EmployeePerformance | null;
// }

// interface CustomTooltipProps {
//   active?: boolean;
//   payload?: Array<{ dataKey: string; value: number }>;
//   label?: string;
//   employeePerformanceData: EmployeePerformance[];
// }

// interface LegendProps {
//   payload?: Array<{ value: string; color: string }>;
// }

// export const PerformanceChart: React.FC<PerformanceChartProps> = ({
//   employees,
//   shifts,
//   maxEmployees = 5,
// }) => {
//   const { employeePerformanceData, teamAverage, completionRate, topPerformer }: PerformanceData = useMemo(() => {
//     // Filter out invalid employees and limit to maxEmployees
//     const validEmployees = employees
//       .filter((emp) => 
//         emp?.id && emp?.user?.first_name !== undefined
//       )
//       .slice(0, maxEmployees);

//     if (validEmployees.length === 0) {
//       return {
//         employeePerformanceData: [],
//         teamAverage: 0,
//         completionRate: 0,
//         topPerformer: null,
//       };
//     }

//     const performanceData: EmployeePerformance[] = validEmployees.map((emp) => {
//       // Get first name and last name from user object
//       const firstName = emp?.user?.first_name || "Unknown";
//       const lastName = emp?.user?.last_name || "";
      
//       // Create display name - show both first and last name if available
//       const displayName = lastName 
//         ? `${firstName} ${lastName.charAt(0)}.` // e.g., "Mikal W."
//         : firstName;

//       const empShifts = shifts.filter((shift) => 
//         shift?.employeeShifts?.some((es) => es?.employee?.id === emp.id) ?? false
//       );

//       const completedShifts = empShifts.filter((s) => s?.status === "completed").length;
//       const missedShifts = empShifts.filter((s) => s?.status === "missed").length;
//       const totalShifts = empShifts.length;

//       const completionPercentage = totalShifts > 0 
//         ? (completedShifts / totalShifts) * 100 
//         : 0;

//       return {
//         id: emp.id,
//         firstName,
//         lastName,
//         name: displayName,
//         completed: completedShifts,
//         missed: missedShifts,
//         total: totalShifts,
//         completionPercentage,
//         rating: totalShifts > 0
//           ? Math.min(5, Math.max(1, (completedShifts / totalShifts) * 5))
//           : 0,
//       };
//     });

//     // Sort by completed shifts (descending)
//     const sortedData = [...performanceData].sort((a, b) => b.completed - a.completed);

//     const totalCompleted = performanceData.reduce((sum, emp) => sum + emp.completed, 0);
//     const totalShifts = performanceData.reduce((sum, emp) => sum + emp.total, 0);

//     const teamAverage = Math.round(totalCompleted / (performanceData.length || 1));
//     const completionRate = totalShifts > 0 
//       ? Math.round((totalCompleted / totalShifts) * 100) 
//       : 0;

//     const topPerformer = sortedData.length > 0 ? sortedData[0] : null;

//     return {
//       employeePerformanceData: sortedData,
//       teamAverage,
//       completionRate,
//       topPerformer,
//     };
//   }, [employees, shifts, maxEmployees]);

//   // Custom tooltip component with proper typing
//   const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, employeePerformanceData }) => {
//     if (!active || !payload || !label) return null;

//     const completed = payload.find((p) => p.dataKey === "completed")?.value || 0;
//     const missed = payload.find((p) => p.dataKey === "missed")?.value || 0;
//     const total = completed + missed;

//     // Find the full name for the tooltip
//     const employee = employeePerformanceData.find(emp => emp.name === label);
//     const fullName = employee 
//       ? `${employee.firstName} ${employee.lastName}` 
//       : label;

//     return (
//       <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
//         <p className="font-semibold text-gray-900 mb-2 text-sm">{fullName}</p>
//         <div className="space-y-1 text-xs">
//           <div className="flex justify-between items-center">
//             <span className="text-green-600">Completed:</span>
//             <span className="font-medium">{completed}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-amber-600">Missed:</span>
//             <span className="font-medium">{missed}</span>
//           </div>
//           <div className="flex justify-between items-center pt-1 border-t border-gray-100">
//             <span className="text-gray-600">Total:</span>
//             <span className="font-medium">{total}</span>
//           </div>
//           {total > 0 && (
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Completion:</span>
//               <span className="font-medium text-blue-600">
//                 {Math.round((completed / total) * 100)}%
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Custom legend component with proper typing
//   const renderLegend: React.FC<LegendProps> = ({ payload }) => {
//     if (!payload) return null;
    
//     return (
//       <div className="flex justify-center items-center gap-4 mt-2">
//         {payload.map((entry, index) => (
//           <div key={`legend-${index}`} className="flex items-center gap-2">
//             <div 
//               className="w-3 h-3 rounded-sm" 
//               style={{ backgroundColor: entry.color }}
//             />
//             <span className="text-sm text-gray-600">{entry.value}</span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   if (employeePerformanceData.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-[300px] w-full bg-gray-50 rounded-lg border border-gray-200">
//         <div className="text-center text-gray-500 p-4">
//           <p className="text-lg font-medium mb-2">No performance data available</p>
//           <p className="text-sm">Add employees and shifts to see performance metrics</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col lg:flex-row gap-6 h-[350px] w-full">
//       {/* Chart Area - 70% width on desktop */}
//       <div className="lg:w-[70%] h-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart
//             data={employeePerformanceData}
//             layout="vertical"
//             margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//             barSize={24}
//           >
//             <CartesianGrid
//               strokeDasharray="3 3"
//               stroke="#f5f5f5"
//               horizontal={false}
//             />
//             <XAxis
//               type="number"
//               tick={{ fill: "#64748b", fontSize: 12 }}
//               axisLine={{ stroke: "#e2e8f0" }}
//               tickLine={{ stroke: "#e2e8f0" }}
//               domain={[0, 'dataMax + 2']}
//             />
//             <YAxis
//               dataKey="name"
//               type="category"
//               width={100}
//               tick={{
//                 fill: "#334155",
//                 fontSize: 12,
//                 fontWeight: 500,
//               }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <Tooltip 
//               content={<CustomTooltip employeePerformanceData={employeePerformanceData} />} 
//             />
//             <Legend content={renderLegend} />
//             <Bar
//               dataKey="completed"
//               name="Completed"
//               fill="#10b981"
//               radius={[0, 6, 6, 0]}
//               animationBegin={100}
//               animationDuration={800}
//             />
//             <Bar
//               dataKey="missed"
//               name="Missed"
//               fill="#f59e0b"
//               radius={[0, 6, 6, 0]}
//               animationBegin={300}
//               animationDuration={800}
//             />
//             {teamAverage > 0 && (
//               <ReferenceLine
//                 x={teamAverage}
//                 stroke="#94a3b8"
//                 strokeDasharray="4 4"
//                 strokeWidth={1.5}
//                 label={{
//                   position: "right",
//                   value: "Team Avg",
//                   fill: "#64748b",
//                   fontSize: 11,
//                   fontWeight: 500,
//                 }}
//               />
//             )}
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Performance Metrics Sidebar - 30% width on desktop */}
//       <div className="lg:w-[30%] flex flex-col justify-between space-y-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm lg:-mt-10">
//         {/* Top Performer Section */}
//         <div className="space-y-3">
//           {topPerformer ? (
//             <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
//               <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
//                 <span className="text-green-700 font-medium text-lg">
//                   {topPerformer.firstName.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//               <div className="min-w-0">
//                 <p className="font-semibold text-gray-900 truncate text-sm">
//                   {topPerformer.firstName} {topPerformer.lastName.charAt(0)}.
//                 </p>
//                 <p className="text-xs text-gray-600 mt-1">
//                   {topPerformer.completed} completed shifts
//                 </p>
//                 <p className="text-xs text-green-700 font-medium mt-1">
//                   {topPerformer.completionPercentage.toFixed(0)}% completion rate
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-4 text-gray-400 text-sm">
//               No top performer data
//             </div>
//           )}
//         </div>

//         {/* Team Stats Section */}
//         <div className="grid grid-cols-2 gap-3">
//           <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
//             <p className="text-xs font-medium text-blue-700 mb-1">Team Average</p>
//             <p className="text-xl font-bold text-blue-900">
//               {teamAverage} <span className="text-xs font-normal text-blue-600 mt-1">completed shifts</span>
//             </p>
           
//           </div>
//           <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
//             <p className="text-xs font-medium text-teal-700 mb-1">Completion Rate</p>
//             <p className="text-xl font-bold text-teal-900">
//               {completionRate}% <span className="text-xs font-normal text-teal-600 mt-1">overall</span>
//             </p>
           
//           </div>
//         </div>

//         {/* Top 3 Performers Section */}
//         <div className="space-y-3">
//           <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Top 3 Performers</h3>
//           <div className="space-y-2">
//             {employeePerformanceData.slice(0, 3).map((emp) => (
//               <div
//                 key={emp.id}
//                 className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
//               >
//                 <span className="text-sm text-gray-700 font-medium truncate max-w-[100px]">
//                   {emp.firstName} {emp.lastName.charAt(0)}.
//                 </span>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm font-semibold text-green-600">
//                     {emp.completed}
//                   </span>
//                   <span className="text-xs text-gray-400">/</span>
//                   <span className="text-xs text-gray-500">
//                     {emp.total}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };