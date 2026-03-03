const FormField = ({ label, ...props }) => {
  return (
    <label className="field-group">
      <span>{label}</span>
      <input className="field-input" {...props} />
    </label>
  )
}

export default FormField
