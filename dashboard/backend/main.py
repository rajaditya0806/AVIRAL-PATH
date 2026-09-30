import asyncio
import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dead_reckoning import NavigationEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TelemetryServer")

app = FastAPI(
    title="Aviral Path - AI/ML Intelligent Dead Reckoning Telemetry API",
    version="1.0.0"
)

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global navigation simulation instance
engine = NavigationEngine()

@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "AI-ML Intelligent Dead Reckoning System",
        "websocket_endpoint": "/ws/telemetry"
    }

@app.websocket("/ws/telemetry")
async def telemetry_websocket(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket Client Connected to /ws/telemetry")

    # Task to handle incoming command messages from WebSocket client
    async def receive_commands():
        nonlocal websocket
        try:
            while True:
                data_text = await websocket.receive_text()
                try:
                    msg = json.loads(data_text)
                    command = msg.get("command")
                    val = msg.get("value")

                    if command == "KILL_GPS":
                        engine.kill_gps = bool(val)
                        logger.info(f"Command KILL_GPS set to: {engine.kill_gps}")

                    elif command == "NOISE_LEVEL":
                        engine.noise_level = float(val)
                        logger.info(f"Command NOISE_LEVEL set to: {engine.noise_level}")

                    elif command == "PLAYBACK":
                        if val == "pause":
                            engine.is_paused = True
                        elif val == "play":
                            engine.is_paused = False
                        elif val == "reset":
                            engine.reset()
                        logger.info(f"Command PLAYBACK set to: {val}")

                    elif command == "SET_SPEED":
                        engine.playback_speed = max(0.2, min(10.0, float(val)))
                        logger.info(f"Command SET_SPEED set to: {engine.playback_speed}")

                    elif command == "SET_DATASET":
                        success = engine.set_dataset(str(val))
                        logger.info(f"Command SET_DATASET '{val}' success: {success}")

                    elif command == "UPLOAD_DATASET":
                        name = msg.get("name", "Uploaded IO-VNBD Data")
                        waypoints = msg.get("waypoints", [])
                        speed = msg.get("speed", 12.0)
                        success = engine.upload_custom_dataset(name, waypoints, speed)
                        logger.info(f"Command UPLOAD_DATASET '{name}' ({len(waypoints)} points) success: {success}")

                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON received: {data_text}")
        except WebSocketDisconnect:
            logger.info("Client command listener disconnected")
        except Exception as e:
            logger.error(f"Error in receive loop: {e}")

    # Launch background listener task
    receive_task = asyncio.create_task(receive_commands())

    try:
        while True:
            # Advance simulation step
            telemetry_data = engine.update_simulation()
            await websocket.send_json(telemetry_data)
            await asyncio.sleep(0.5) # Stream telemetry every 500ms
    except WebSocketDisconnect:
        logger.info("WebSocket Client Disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        receive_task.cancel()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
