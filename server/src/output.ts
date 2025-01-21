export default function output(
  data: object,
  error: null,
  status: string = "ok"
) {
  return { data, error, status };
}
