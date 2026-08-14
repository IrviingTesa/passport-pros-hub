UPDATE public.ds160_resources
SET title = 'Preguntas posibles — Primera vez',
    description = 'PDF de preguntas posibles para solicitantes de visa por primera vez.'
WHERE slug = 'preguntas-posibles';

INSERT INTO public.ds160_resources (slug, title, description)
VALUES ('preguntas-posibles-renovacion', 'Preguntas posibles — Renovación', 'PDF de preguntas posibles para solicitantes que renuevan su visa.')
ON CONFLICT (slug) DO NOTHING;