<template>
    <b-container>
        <b-row>
            <b-col>
                <b-alert class="alert" v-model="error" variant="danger" dismissible>{{ error_msg }}</b-alert>

                <!-- FORMULARIO -->
                <b-form @submit.stop.prevent="onSubmit" @reset.prevent="onReset" v-model="valid">                

                    <b-form-input v-model="id" type="text"></b-form-input>

                    <b-form-group id="input-name" label="Name" label-for="name">
                        <b-form-input
                            id="name"
                            v-model.trim="$v.name.$model"
                            type="text"
                            placeholder="Enter name"
                            :state="classInput($v.name)"
                        ></b-form-input>

                        <b-form-invalid-feedback :state="classInput($v.name)">{{ getErrorMessage($v.name) }}</b-form-invalid-feedback>
                    </b-form-group>

                    <b-form-group id="input-position" label="Position" label-for="position">
                        <b-form-input
                            id="position"
                            v-model.trim="$v.position.$model"
                            type="text"
                            placeholder="Enter position"
                            :state="classInput($v.position)"
                        ></b-form-input>

                        <b-form-invalid-feedback :state="classInput($v.position)">{{ getErrorMessage($v.position) }}</b-form-invalid-feedback>
                    </b-form-group>

                    <b-form-group id="input-office" label="Office" label-for="office">
                        <b-form-input
                            id="office"
                            v-model.trim="$v.office.$model"
                            type="text"
                            placeholder="Enter office"
                            :state="classInput($v.office)"
                        ></b-form-input>

                        <b-form-invalid-feedback :state="classInput($v.office)">{{ getErrorMessage($v.office) }}</b-form-invalid-feedback>
                    </b-form-group>

                    <b-form-group id="input-salary" label="Salary" label-for="salary">
                        <b-form-input
                            id="salary"
                            v-model.number="$v.salary.$model"
                            type="number"
                            placeholder="Enter salary"
                            :state="classInput($v.salary)"
                        ></b-form-input>

                        <b-form-invalid-feedback :state="classInput($v.salary)">{{ getErrorMessage($v.salary) }}</b-form-invalid-feedback>
                    </b-form-group>

                    <b-button type="submit" variant="primary" class="mr-4">Submit</b-button>
                    <b-button type="reset" variant="danger">Reset</b-button>
                </b-form>
            </b-col>
            
            <b-col>
                <!-- TABLA -->
                <b-table-simple hover small caption-top responsive>
                    <b-thead head-variant="dark">
                        <b-tr>
                            <b-th>Name</b-th>
                            <b-th>Position</b-th>
                            <b-th>Office</b-th>
                            <b-th>Salary</b-th>
                            <b-th class="text-center">Actions</b-th>
                        </b-tr>
                    </b-thead>

                    <b-tbody>
                        <b-tr v-for="employee in employees" :key="employee._id">
                            <b-td>{{ employee.name }}</b-td>
                            <b-td>{{ employee.position }}</b-td>
                            <b-td>{{ employee.office }}</b-td>
                            <b-td class="text-right">{{ employee.salary }}</b-td>
                            <b-td>
                                <b-button size="sm" variant="info" class="ml-3 mr-2" @click="edit(employee)">
                                    <b-icon icon="pencil-fill"></b-icon>
                                </b-button>

                                <b-button size="sm" variant="danger" @click="trash(employee._id)">
                                    <b-icon icon="trash-fill"></b-icon>
                                </b-button>
                            </b-td>
                        </b-tr>                        
                    </b-tbody>

                    <b-tfoot>
                        <b-tr>
                            <b-td colspan="7" variant="secondary" class="text-right">
                                Total Rows: <b>{{ total_rows }}</b>
                            </b-td>
                        </b-tr>
                    </b-tfoot>
                </b-table-simple>

                <!-- NAVEGACION -->
                <b-pagination
                    v-model="page"
                    :total-rows="totalDocs"
                    :per-page="limit"
                    first-text="First"
                    prev-text="Prev"
                    next-text="Next"
                    last-text="Last"
                    align="center"
                ></b-pagination>

                <p> {{`PAGINA ACTUAL: ${page}`}} </p>
                <p> {{`TOTAL PAGINAS: ${totalPages}`}} </p>
                <p> {{`TOTAL DOCS: ${totalDocs}`}} </p>
                <p> {{`TOTAL ROWS: ${total_rows}`}} </p>

            </b-col>
        </b-row>
    </b-container>
</template>

<script>
    import employeesService from '../services/api/employeesService.js';
    import { required, minValue, numeric } from 'vuelidate/lib/validators';
    import alertService from '../services/alert/alertService';

    export default {
        name: "EmployeesList",
        data () {
            return {
                id: null,
                name: null,
                position: null,
                office: null,
                salary: null,
                employees: [],
                page: 1,
                paginationMin: 1,
                paginationMax: 10,
                // paginacion: [],
                // hasNextPage: false,
                // hasPrevPage: false,
                totalPages: 0,
                totalDocs: 0,
                limit: 10,
                valid: false,
                error: false,
                error_msg: '',
                submit: false
            }
        },

        validations: {
            name: { required },
            position: { required },
            office: { required },
            salary: { required, minValue: minValue(1), numeric }
        },

        watch: {
            name(newValue, oldValue) {
                this.submit = false;
            },
            position(newValue, oldValue) {
                this.submit = false;
            },
            office(newValue, oldValue) {
                this.submit = false;
            },
            salary(newValue, oldValue) {
                this.submit = false;
            },
            page() {
                this.getAll();
            }
        },

        computed: {
            total_rows(){
                return this.employees.length;
            },

            classInput: (app) => (field) => {
                if (app.submit) {
                    return (field.$error && field.$dirty ? false : !field.$error && field.$dirty ? true : null);    
                }else {
                    return (!field.$error && field.$dirty ? true : null);
                }
            },

            getErrorMessage: () => (field) => {
                /* VERIFICAR SI TIENE ERROR */
                if (!field.$error) {
                    return null
                }

                const messages = {
                    required: 'Campo requerido',
                    minValue: `El campo tiene que ser mayor a 0`,
                    numeric: 'El campo debe ser numerico'
                };

                for (const property in field) {
                    if (!property.includes('$') && !field[property]) {
                        return messages[property];
                    }
                }

                return null;
            }
        },

        methods: {
            limpiarDatos(){
                this.id = null;
                this.name = null;
                this.position = null;
                this.office = null;
                this.salary = null;
                this.valid = false;
                this.error = false,
                this.error_msg = '';
            },

            async getAll() {
                try {
                    const res = await employeesService.get(`?page=${this.page}&paginationMin=${this.paginationMin}&paginationMax=${this.paginationMax}`);

                    this.employees = res.data.results['docs'];

                    console.log(res.data.results)

                    // PAGINACION
                    // this.paginacion = res.data.results.pagination;
                    // this.hasNextPage = res.data.results.hasNextPage;
                    // this.hasPrevPage = res.data.results.hasPrevPage;
                    this.paginationMin = res.data.results.pagination[0];
                    this.paginationMax = res.data.results.pagination[res.data.results.pagination.length-1]
                    this.totalPages = res.data.results.totalPages;
                    this.totalDocs = res.data.results.totalDocs;

                } catch (err) {
                    console.log(err);
                }
            },

            onSubmit() {
                /* VERIFICAR LA VALIDES DEL FORMULARIO */
                this.submit = true;

                this.$v.$touch();
                
                if (this.$v.$invalid) {
                    // Mensaje Error
                    this.error = true;
                    this.error_msg = 'Verifique los siguientes Errores.';
                    return;
                }

                if (this.id) {
                    this.editar();
                }else {
                    this.crear()
                }
            },

            async crear() {
                let datos = {
                    name: this.name,
                    position: this.position,
                    office: this.office,
                    salary: this.salary
                }

                const res = await employeesService.post('', datos);

                if (res.data.error) {
                    // Mensaje Error
                    alertService.muestraAlerta('error', 'Oops...', res.data.message);
                }else {
                    // Mensaje Ok
                    alertService.muestraAlerta('success', 'Hecho', 'Empleado Creado con Exito');

                    // console.log(this.total_rows)

                    if ((this.totalDocs + 1) > 10) {
                        this.page = ++ this.totalPages;    
                    } else {
                        this.page = this.totalPages;
                    }

                    this.limpiarDatos();

                    this.getAll();
                }
            },

            async editar() {
                let datos = {
                    _id: this.id,
                    name: this.name,
                    position: this.position,
                    office: this.office,
                    salary: this.salary
                }

                const res = await employeesService.put(this.id, datos);

                if (res.data.error) {
                    // Mensaje Error
                    alertService.muestraAlerta('error', 'Oops...', res.data.message);
                }else {
                    // Mensaje Ok
                    alertService.muestraAlerta('success', 'Hecho', 'Empleado Modificado con Exito');

                    this.limpiarDatos();

                    this.getAll();
                }
            },

            onReset() {
                this.limpiarDatos();
                
                this.$v.$reset();
            },

            edit(employee) {
                this.id = employee._id;
                this.name = employee.name;
                this.position = employee.position;
                this.office = employee.office;
                this.salary = employee.salary;
            },

            trash(_id) {
                alertService.muestraConfirmacion('question', 'Desea Eliminar el Registro?').then( async (result) => {
                    if (result.isConfirmed) {
                        try {
                            const res = await employeesService.delete(_id);

                            if (res.data.error) {
                                // Mensaje Error
                                alertService.muestraAlerta('error', 'Oops...', res.data.message);
                            }else {
                                // Mensaje Ok
                                alertService.muestraAlerta('success', 'Hecho', 'Empleado Eliminado con Exito');
                                
                                this.limpiarDatos();

                                this.getAll();
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                });                
            }
        },

        mounted () {
            this.getAll();
        },
    };
</script>
