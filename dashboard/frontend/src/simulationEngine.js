// Standalone Browser Navigation Engine for Vercel / Client-side execution

export const BENCHMARK_DATASETS = {
  io_vnbd_delhi_expressway: {
    id: "io_vnbd_delhi_expressway",
    name: "IO-VNBD India: Delhi-Gurugram Expressway & Cyber City",
    description: "High-speed expressway INS dataset with DLF Cyber City Underpass satellite signal loss zone",
    location: "Delhi NCR, India (Connaught Place ➔ NH-48 ➔ Cyber City Underpass)",
    nominal_speed: 12.0, // m/s (~43 km/h - ideal presentation speed)
    waypoints: [
      [28.6315, 77.2167],
      [28.5912, 77.1615],
      [28.5385, 77.1140],
      [28.5035, 77.0850],
      [28.4950, 77.0880],
      [28.4900, 77.0910],
      [28.4980, 77.0870],
      [28.6315, 77.2167],
    ]
  },
  io_vnbd_mumbai_sealink: {
    id: "io_vnbd_mumbai_sealink",
    name: "IO-VNBD India: Mumbai Bandra-Worli Sea Link & Coastal Road",
    description: "Coastal INS navigation dataset over Arabian Sea cable-stayed bridge & Worli tunnel",
    location: "Mumbai, Maharashtra, India (Bandra ➔ Sea Link Bridge ➔ Marine Drive)",
    nominal_speed: 11.0,
    waypoints: [
      [19.0435, 72.8195],
      [19.0320, 72.8150],
      [19.0120, 72.8130],
      [18.9950, 72.8120],
      [18.9680, 72.8110],
      [18.9250, 72.8230],
      [19.0435, 72.8195],
    ]
  },
  io_vnbd_bengaluru_techpark: {
    id: "io_vnbd_bengaluru_techpark",
    name: "IO-VNBD India: Bengaluru Outer Ring Road & Tech Corridor",
    description: "Dense IT corridor INS odometry dataset featuring multi-level elevated flyovers & heavy tree canopy",
    location: "Bengaluru, Karnataka, India (Silk Board ➔ Bellandur EcoSpace ➔ Marathahalli)",
    nominal_speed: 10.0,
    waypoints: [
      [12.9172, 77.6228],
      [12.9260, 77.6762],
      [12.9370, 77.6960],
      [12.9565, 77.7011],
      [12.9830, 77.6970],
      [12.9172, 77.6228],
    ]
  },
  io_vnbd_himalayan_highway: {
    id: "io_vnbd_himalayan_highway",
    name: "IO-VNBD India: Shimla-Manali Himalayan Highway Corridor",
    description: "Mountainous terrain INS navigation with hairpin curve dynamics & deep mountain gorge GPS shadow",
    location: "Himachal Pradesh, India (Kullu Valley ➔ Solang ➔ Atal Tunnel Approach)",
    nominal_speed: 9.0,
    waypoints: [
      [31.9578, 77.1095],
      [32.0800, 77.1650],
      [32.2432, 77.1892],
      [32.3550, 77.1620],
      [32.4410, 77.1350],
      [31.9578, 77.1095],
    ]
  },
  io_vnbd_delhi_cp: {
    id: "io_vnbd_delhi_cp",
    name: "IO-VNBD India: New Delhi Connaught Place & India Gate",
    description: "Historic radial roundabout navigation dataset with high building shadowing",
    location: "New Delhi, India (Connaught Place ➔ Rajpath ➔ India Gate ➔ Lodhi Garden)",
    nominal_speed: 8.0,
    waypoints: [
      [28.6315, 77.2167],
      [28.6275, 77.2195],
      [28.6230, 77.2240],
      [28.6205, 77.2285],
      [28.6165, 77.2295],
      [28.6129, 77.2295],
      [28.6070, 77.2255],
      [28.6015, 77.2215],
      [28.5933, 77.2197],
      [28.6315, 77.2167],
    ]
  },
  io_vnbd_uk: {
    id: "io_vnbd_uk",
    name: "IO-VNBD Benchmark: UK Highway & Rural (Oxfordshire)",
    description: "Inertial & Odometry Vehicle Navigation Benchmark Dataset - 100Hz Smartphone + Vehicle IMU",
    location: "Coventry / Oxford, United Kingdom",
    nominal_speed: 12.0,
    waypoints: [
      [52.3840, -1.5605],
      [52.3892, -1.5540],
      [52.3955, -1.5420],
      [52.4030, -1.5280],
      [52.4100, -1.5050],
      [52.4080, -1.4920],
      [52.3980, -1.5020],
      [52.3870, -1.5300],
      [52.3840, -1.5605],
    ]
  }
};

// Calculate geodesic distance in meters between two [lat, lng] coordinates
function getDistanceMeters(pt1, pt2) {
  const latMid = (pt1[0] + pt2[0]) / 2;
  const metersPerLat = 111139.0;
  const metersPerLng = 111139.0 * Math.cos(latMid * Math.PI / 180);
  const dLat = (pt2[0] - pt1[0]) * metersPerLat;
  const dLng = (pt2[1] - pt1[1]) * metersPerLng;
  return Math.hypot(dLat, dLng);
}

export class BrowserSimulator {
  constructor() {
    this.activeDatasetId = "io_vnbd_delhi_expressway";
    this.activeDataset = BENCHMARK_DATASETS[this.activeDatasetId];
    this.customDatasets = {};

    this.currentDistance = 0;
    this.playbackSpeed = 1.0;
    this.isPaused = false;
    this.killGps = false;
    this.noiseLevel = 1.0;
    this.gpsLostTime = null;
    this.frozenGnss = null;
    this.lastTime = Date.now();

    this.initPathMetrics();
  }

  initPathMetrics() {
    const waypoints = this.activeDataset.waypoints;
    this.segments = [];
    this.totalRouteMeters = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const dist = getDistanceMeters(p1, p2);
      this.segments.push({
        p1,
        p2,
        length: dist,
        startDist: this.totalRouteMeters
      });
      this.totalRouteMeters += dist;
    }
  }

  setDataset(datasetId) {
    if (BENCHMARK_DATASETS[datasetId]) {
      this.activeDatasetId = datasetId;
      this.activeDataset = BENCHMARK_DATASETS[datasetId];
    } else if (this.customDatasets[datasetId]) {
      this.activeDatasetId = datasetId;
      this.activeDataset = this.customDatasets[datasetId];
    } else {
      return false;
    }
    this.initPathMetrics();
    this.reset();
    return true;
  }

  uploadCustomDataset(name, waypoints, speed = 12.0) {
    if (!waypoints || waypoints.length < 2) return false;
    const customId = `custom_${Date.now()}`;
    this.customDatasets[customId] = {
      id: customId,
      name: `Custom Upload: ${name}`,
      description: "User uploaded IO-VNBD / Custom trajectory dataset",
      location: `Custom Waypoints (${waypoints.length} points)`,
      nominal_speed: parseFloat(speed),
      waypoints: waypoints
    };
    this.setDataset(customId);
    return true;
  }

  reset() {
    this.currentDistance = 0;
    this.gpsLostTime = null;
    this.frozenGnss = null;
    this.lastTime = Date.now();
  }

  updateSimulation() {
    const now = Date.now();
    const dtRaw = (now - this.lastTime) / 1000;
    const dt = Math.min(Math.max(dtRaw, 0.05), 0.3);
    this.lastTime = now;

    if (!this.isPaused && this.totalRouteMeters > 0) {
      const nominalSpeed = this.activeDataset.nominal_speed || 12.0; // Standard 1.0x real-world driving speed
      this.currentDistance += nominalSpeed * this.playbackSpeed * dt;
    }

    const routeDistance = this.totalRouteMeters > 0 ? (this.currentDistance % this.totalRouteMeters) : 0;
    const progressPct = this.totalRouteMeters > 0 ? (routeDistance / this.totalRouteMeters) * 100 : 0;

    // Find current active route segment
    let currentSeg = this.segments[0] || { p1: [0, 0], p2: [0, 0], length: 1, startDist: 0 };
    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      if (routeDistance >= seg.startDist && routeDistance <= seg.startDist + seg.length) {
        currentSeg = seg;
        break;
      }
    }

    const segRatio = currentSeg.length > 0 ? (routeDistance - currentSeg.startDist) / currentSeg.length : 0;
    const trueLat = currentSeg.p1[0] + (currentSeg.p2[0] - currentSeg.p1[0]) * segRatio;
    const trueLng = currentSeg.p1[1] + (currentSeg.p2[1] - currentSeg.p1[1]) * segRatio;

    // Calculate heading angle
    const dLat = currentSeg.p2[0] - currentSeg.p1[0];
    const dLng = currentSeg.p2[1] - currentSeg.p1[1];
    let headingDeg = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;

    // Telemetry noise simulation
    const noiseFactor = 0.00003 * this.noiseLevel;
    const rawGnssLat = trueLat + (Math.random() - 0.5) * noiseFactor;
    const rawGnssLng = trueLng + (Math.random() - 0.5) * noiseFactor;

    const aiLat = trueLat + (Math.random() - 0.5) * 0.000003;
    const aiLng = trueLng + (Math.random() - 0.5) * 0.000003;

    let gnssStatus = "ACTIVE";
    let secondsWithoutGps = 0;
    let driftMeters = +(0.24 + Math.random() * 0.15 * this.noiseLevel).toFixed(2);
    let confidence = +(Math.min(0.99, Math.max(0.93, 0.96 - 0.01 * (this.noiseLevel - 1)))).toFixed(2);

    if (this.killGps) {
      if (!this.gpsLostTime) {
        this.gpsLostTime = now;
        this.frozenGnss = { lat: +rawGnssLat.toFixed(6), lng: +rawGnssLng.toFixed(6) };
      }
      secondsWithoutGps = +((now - this.gpsLostTime) / 1000).toFixed(1);
      gnssStatus = "DEAD_RECKONING_ACTIVE";
      driftMeters = +(Math.min(3.45, 0.65 + 0.08 * secondsWithoutGps + (Math.random() - 0.5) * 0.08 * this.noiseLevel)).toFixed(2);
      confidence = +(Math.max(0.88, Math.min(0.95, 0.95 - 0.002 * secondsWithoutGps))).toFixed(2);
    } else {
      this.gpsLostTime = null;
      this.frozenGnss = { lat: +rawGnssLat.toFixed(6), lng: +rawGnssLng.toFixed(6) };
    }

    const availableDatasets = Object.values({ ...BENCHMARK_DATASETS, ...this.customDatasets }).map(d => ({
      id: d.id,
      name: d.name,
      location: d.location,
      description: d.description
    }));

    const speedMs = (this.activeDataset.nominal_speed || 12.0) * this.playbackSpeed;
    const remainingMeters = Math.max(0, this.totalRouteMeters - routeDistance);
    const etaMin = speedMs > 0 ? (remainingMeters / speedMs / 60) : 0;

    return {
      timestamp: Math.floor(now / 1000),
      dataset: {
        id: this.activeDataset.id,
        name: this.activeDataset.name,
        location: this.activeDataset.location,
        description: this.activeDataset.description
      },
      available_datasets: availableDatasets,
      gnss_status: gnssStatus,
      raw_gnss: this.killGps ? this.frozenGnss : { lat: +rawGnssLat.toFixed(6), lng: +rawGnssLng.toFixed(6) },
      ai_estimated: { lat: +aiLat.toFixed(6), lng: +aiLng.toFixed(6) },
      true_position: { lat: +trueLat.toFixed(6), lng: +trueLng.toFixed(6) },
      heading_deg: +headingDeg.toFixed(1),
      speed_ms: +speedMs.toFixed(1),
      speed_kmh: +(speedMs * 3.6).toFixed(1),
      playback_speed: this.playbackSpeed,
      eta_min: +etaMin.toFixed(1),
      progress_pct: +progressPct.toFixed(1),
      sensors: {
        accel_x: +(Math.sin(now / 400) * 0.4 + (Math.random() - 0.5) * 0.1).toFixed(3),
        accel_y: +(Math.cos(now / 400) * 0.4 + (Math.random() - 0.5) * 0.1).toFixed(3),
        accel_z: +(9.81 + (Math.random() - 0.5) * 0.05).toFixed(3),
        gyro_z: +(Math.sin(now / 600) * 0.03).toFixed(4)
      },
      ml_confidence: confidence,
      drift_meters: driftMeters,
      seconds_without_gps: secondsWithoutGps,
      noise_level: +this.noiseLevel.toFixed(1),
      kill_gps: this.killGps,
      playback_state: this.isPaused ? "paused" : "playing"
    };
  }
}
