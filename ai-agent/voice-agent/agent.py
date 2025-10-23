# import asyncio
# from dotenv import load_dotenv
# from livekit.agents import (
#     AutoSubscribe,
#     JobContext,
#     WorkerOptions,
#     cli,
#     llm,
# )
# from livekit.plugins import openai
# import aiohttp

# # Load environment variables
# load_dotenv()

# SALON_CONTEXT = """You are a friendly receptionist for Bella's Beauty Salon.

# SERVICES:
# - Haircut: $45 (45 minutes)
# - Hair Coloring: $120 (2 hours)  
# - Manicure: $35 (30 minutes)
# - Pedicure: $50 (45 minutes)
# - Facial: $80 (60 minutes)

# HOURS: Monday-Saturday 9 AM - 7 PM, Sunday 10 AM - 5 PM
# LOCATION: Noida Sector-62, Noida
# PHONE: +123456789

# IMPORTANT: If asked about appointments, bookings, availability, or anything you don't know, say:
# "Let me check with my supervisor and get back to you shortly."
# Then call the escalate_to_supervisor function.
# """


# async def entrypoint(ctx: JobContext):
    
#     async def escalate_to_supervisor(question: str, customer_phone: str):
#         """Escalate question to human supervisor"""
#         try:
#             async with aiohttp.ClientSession() as session:
#                 await session.post(
#                     'http://localhost:3000/api/agent/function-call',
#                     json={
#                         'functionName': 'request_help',
#                         'args': {
#                             'question': question,
#                             'customerPhone': customer_phone
#                         },
#                         'callId': ctx.room.name
#                     },
#                     timeout=aiohttp.ClientTimeout(total=5)
#                 )
#             return "I've sent your question to my supervisor. They'll call you back shortly!"
#         except Exception as e:
#             print(f"Error escalating to supervisor: {e}")
#             return "I'm having trouble reaching my supervisor right now. Please call us at +123456789."

#     # Connect to the room first
#     await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

#     # Create components
#     from livekit.agents import vad
    
#     stt = openai.STT()
#     llm_instance = openai.LLM(model="gpt-4o-mini")
#     tts = openai.TTS(voice="nova")
    
#     # Create function context
#     fnc_ctx = llm.FunctionContext()
#     fnc_ctx.ai_callable()(escalate_to_supervisor)

#     # Create assistant
#     from livekit import agents
    
#     assistant = agents.VoiceAssistant(
#         vad=vad.VAD.load(),
#         stt=stt,
#         llm=llm_instance,
#         tts=tts,
#         fnc_ctx=fnc_ctx,
#         chat_ctx=llm.ChatContext().append(
#             role="system",
#             text=SALON_CONTEXT,
#         ),
#     )

#     # Start the assistant
#     assistant.start(ctx.room)

#     # Send initial greeting
#     await assistant.say("Hello! Welcome to Bella's Beauty Salon. How can I help you today?")


# if __name__ == "__main__":
#     cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))


import asyncio
from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.plugins import openai
import aiohttp

# Load environment variables
load_dotenv()

SALON_CONTEXT = """You are a friendly receptionist for Bella's Beauty Salon.

SERVICES:
- Haircut: $45 (45 minutes)
- Hair Coloring: $120 (2 hours)
- Manicure: $35 (30 minutes)
- Pedicure: $50 (45 minutes)
- Facial: $80 (60 minutes)

HOURS: Monday-Saturday 9 AM - 7 PM, Sunday 10 AM - 5 PM
LOCATION: Noida Sector-62, Noida
PHONE: +123456789

IMPORTANT: If asked about appointments, bookings, availability, or anything you don't know, say:
"Let me check with my supervisor and get back to you shortly."
Then call the escalate_to_supervisor function.
"""


async def entrypoint(ctx: JobContext):
    async def escalate_to_supervisor(question: str, customer_phone: str):
        """Escalate question to human supervisor"""
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    "http://localhost:3000/api/agent/function-call",
                    json={
                        "functionName": "request_help",
                        "args": {
                            "question": question,
                            "customerPhone": customer_phone,
                        },
                        "callId": ctx.room.name,
                    },
                    timeout=aiohttp.ClientTimeout(total=5),
                )
            return "I've sent your question to my supervisor. They'll call you back shortly!"
        except Exception as e:
            print(f"Error escalating to supervisor: {e}")
            return "I'm having trouble reaching my supervisor right now. Please call us at +123456789."

    # Connect to the LiveKit room
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Initialize AI components
    from livekit.agents import vad

    stt = openai.STT()
    llm_instance = openai.LLM(model="gpt-4o-mini")
    tts = openai.TTS(voice="nova")

    # ✅ FunctionContext API (correct for v1.1.7)
    fn_ctx = llm.FunctionContext()
    fn_ctx.ai_callable()(escalate_to_supervisor)

    # Build assistant
    from livekit import agents

    assistant = agents.VoiceAssistant(
        vad=vad.VAD.load(),
        stt=stt,
        llm=llm_instance,
        tts=tts,
        fnc_ctx=fn_ctx,  # note old param name
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=SALON_CONTEXT,
        ),
    )

    # Start assistant
    assistant.start(ctx.room)

    # Greeting
    await assistant.say("Hello! Welcome to Bella's Beauty Salon. How can I help you today?")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))


