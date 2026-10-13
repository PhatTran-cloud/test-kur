# Meaning, timing and manifests
Tags identify language. Meaning beats change understanding/state/scale/viewpoint/emotion. Scenes are continuous worlds, shots camera intervals, actions triggered behaviors, landmarks readable changes, transitions motivated edges. Claims/beats span shots many-to-many; SB/ASR paragraphs do not force cuts; lifecycle keys are not new meaning beats.

production.json owns measured media/timing/reviews/read-log/sound/authorization. claim-ledger.json owns evidence/uncertainty. art-system.json owns identity. asset-bible.json owns canonical subjects. scene-manifest.json owns beats/scenes/shots/instances/actions/landmarks/bindings. transition-graph.json owns handoff cause/invariant.

Use global half-open intervals [start,end). Shots cover picture without gaps/overlaps. Transition windows are explicit, not hidden subtraction. Local frame = global - interval start; no double Sequence offsets. Anchor frame = floor(word.start * fps)+vo_start_frame+authored_offset_frames. Inspect ASR alignment; provisional timing blocks build.
Measured audio duration determines ceil(duration*fps)+vo_start_frame+tail_frames. Lead/tail black/silence is declared; last ASR word is not file duration.

User-requested unnarrated films declare timing.mode=authored_audio, a real measured soundtrack, empty timestamps_file and word anchors, and vo_start_frame=0. Authored global action/landmark frames own timing; no invented ASR words. Omitted mode remains narrated and retains VO/word checks. No creative/review/render gate is waived.

preview_v6.py with a current preview receipt renders styleframes/animatic/pilot/QA evidence from a structurally valid draft. Outputs stay in their named packet folders, never render/final.mp4. Evidence is not approval; final guarded rendering retains all gates. Preserve evidence with revision names.

Bindings name action/landmark/transition/source implementation. `production.delivery` records exact Remotion entry (relative to animation-studio) and composition ID; the guarded render checks both against the reviewed packet. Absolute frame and seed reconstruct state; mount does not reset identity/events/residue. QA includes endpoints, nonsequential seeks, first frame, N/N+30/N+90 and encoded output. Plan validates contracts; build adds measured source/reviews/bindings; render adds actual QA/authorization. No aesthetic certification from JSON.

Physical relations use canonical `relation_id` in their supporting claims' `causal_visuals_allowed`; permission for a different relation is insufficient. `v6_packet.py hashes <slug>` prints hashes for actual review, including production decisions and audio/timestamps content. It never approves a packet. Provisional planning can compile with clearly recorded warnings; incomplete templates cannot. Verified build/render stages reject provisional timing.
