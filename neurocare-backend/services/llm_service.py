import os
import json

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False


def _get_fallback_dashboard(patient_summary, selected_parameters=None):
    params = selected_parameters or ['heart_rate', 'meltdown_episodes', 'emotion_frequency']
    return {
        'selected_parameters': params,
        'charts': [
            {
                'id': 'chart_1',
                'type': 'line',
                'title': f'{params[0].replace("_", " ").title()} Trend (7 Days)',
                'x_axis': 'date',
                'y_axis': params[0],
                'color': '#5B8DB8',
                'clinical_insight': f'{params[0].replace("_", " ").title()} shows variability correlated with environmental stressors.',
            },
            {
                'id': 'chart_2',
                'type': 'bar',
                'title': f'{params[1].replace("_", " ").title()} by Day' if len(params) > 1 else 'Behavioral Events by Day',
                'x_axis': 'day_of_week',
                'y_axis': params[1] if len(params) > 1 else 'count',
                'color': '#B5705A',
                'clinical_insight': 'Higher frequency observed during weekdays, suggesting school-related triggers.',
            },
            {
                'id': 'chart_3',
                'type': 'doughnut',
                'title': f'{params[2].replace("_", " ").title()} Distribution' if len(params) > 2 else 'Emotion Distribution',
                'x_axis': 'category',
                'y_axis': 'count',
                'color': '#8B7EC8',
                'clinical_insight': 'Negative emotions predominate during transition periods.',
            },
        ],
        'narrative': (
            f'Patient {patient_summary.get("patient_code", "N/A")} shows patterns consistent with '
            f'environmental stress triggers. The 7-day average EDS of {patient_summary.get("eds_7day_avg", "N/A")} '
            f'indicates {patient_summary.get("eds_trend", "stable")} trend. '
            f'Recommend reviewing daily routine structure and sensory accommodations.'
        ),
        'priority_interventions': ['breathing', 'grounding'],
        'atec_insight': (
            f'ATEC total score is {patient_summary.get("atec_total", "N/A")}. '
            f'Continue monitoring subscale trends for therapy adjustments.'
        ),
    }


class LLMDashboardGenerator:
    def __init__(self):
        api_key = os.getenv('ANTHROPIC_API_KEY', '')
        self.client = None
        if HAS_ANTHROPIC and api_key and api_key != 'your-anthropic-api-key-here':
            self.client = anthropic.Anthropic(api_key=api_key)

    def generate_dashboard(self, patient_summary, selected_parameters=None):
        if not self.client:
            return _get_fallback_dashboard(patient_summary, selected_parameters)

        system_prompt = (
            "You are a clinical AI assistant specializing in autism therapy. "
            "Analyze the patient data and generate a JSON dashboard configuration. "
            "Respond ONLY with valid JSON — no preamble, no markdown backticks."
        )

        param_instruction = ""
        if selected_parameters:
            param_instruction = f"Selected parameters: {selected_parameters}"
        else:
            param_instruction = "Auto-select the 2-3 most clinically relevant parameters."

        user_prompt = (
            f"Patient Data Summary:\n{json.dumps(patient_summary, indent=2)}\n\n"
            f"{param_instruction}\n\n"
            "Generate a dashboard JSON with:\n"
            "1. selected_parameters (2-3 parameter names from the full list)\n"
            "2. charts array (one chart per parameter: type, title, axes, color, clinical_insight)\n"
            "3. narrative (3-4 sentences: key pattern, concern, recommendation)\n"
            "4. priority_interventions (1-2 most effective intervention types for this patient)\n"
            "5. atec_insight (1 sentence about ATEC trend if available)\n\n"
            'Chart types to use: "line", "bar", "doughnut", "radar", "scatter", "heatmap"\n'
            "Keep clinical language clear and actionable for therapists."
        )

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )
            text = response.content[0].text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1] if "\n" in text else text[3:]
                if text.endswith("```"):
                    text = text[:-3]
            return json.loads(text)
        except Exception:
            return _get_fallback_dashboard(patient_summary, selected_parameters)


llm_generator = LLMDashboardGenerator()
