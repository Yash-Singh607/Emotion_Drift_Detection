from drift_detector import calculate_drift

def escalation_status(timeline):
    drift = calculate_drift(timeline)

    if drift > 0.45:
        return "HIGH RISK"
    if drift > 0.25:
        return "MEDIUM RISK"
    return "LOW RISK"
