
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

const data = [
  { name: "Jan", enrollments: 45, completions: 20 },
  { name: "Feb", enrollments: 52, completions: 25 },
  { name: "Mar", enrollments: 49, completions: 30 },
  { name: "Apr", enrollments: 63, completions: 28 },
  { name: "May", enrollments: 58, completions: 33 },
  { name: "Jun", enrollments: 48, completions: 22 },
  { name: "Jul", enrollments: 61, completions: 35 },
  { name: "Aug", enrollments: 55, completions: 31 },
  { name: "Sep", enrollments: 67, completions: 41 },
  { name: "Oct", enrollments: 60, completions: 38 },
  { name: "Nov", enrollments: 71, completions: 44 },
  { name: "Dec", enrollments: 74, completions: 47 },
];

const AdminEnrollmentStats = () => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Enrollment Analytics</CardTitle>
        <CardDescription>
          Course enrollments and completions for the current year
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="enrollments" fill="#8884d8" name="Enrollments" />
              <Bar dataKey="completions" fill="#82ca9d" name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminEnrollmentStats;
