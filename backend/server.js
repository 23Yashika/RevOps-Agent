
import dotenv from "dotenv";
dotenv.config();

const [
  { default: express },
  { default: cors },
  { default: hubspotRoutes },
   { default: googleRoutes },
     { default: analysisRoutes },
] = await Promise.all([
  import("express"),
  import("cors"),
  import("./src/routes/hubspotRoutes.js"),
   import("./src/routes/googleRoutes.js"),
    import("./src/routes/analysisRoutes.js"),
    
]);
import actionsRoutes from "./src/routes/actions.routes.js";
import posthogRoutes from "./src/routes/posthog.routes.js";
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

app.use(express.json());
app.use("/api/posthog", posthogRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RevOps Agent API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "revops-agent",
    status: "healthy",
  });
});

app.use("/api/hubspot", hubspotRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/actions", actionsRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`RevOps backend running at http://localhost:${PORT}`);
});
