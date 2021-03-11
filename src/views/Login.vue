<template>
    <div class="home">
        <div class="wrapper fadeInDown">
            <div id="formContent">
                <!-- Tabs Titles -->

                <!-- Icon -->
                <div class="fadeIn first">
                    <img src="@/assets/logo.png" id="icon" alt="User Icon" />
                </div>

                <b-alert class="alert" v-model="error" variant="danger" dismissible>{{ error_msg }}</b-alert>

                <!-- Login Form -->
                <b-form @submit.prevent="enviar">
                    <b-input-group class="grupo fadeIn second">                        
                        <b-input-group-prepend is-text class="grupo-prend">
                            <b-icon icon="envelope-fill" :variant="classIcon($v.email)"></b-icon>
                        </b-input-group-prepend>
                        
                        <b-form-input 
                            type="text"
                            id="login"
                            name="email"
                            placeholder="Email"
                            :state="classInput($v.email)"
                            v-model.trim="$v.email.$model"                        
                        ></b-form-input>
                    </b-input-group>

                    <b-form-invalid-feedback class="mensaje" :state="classInput($v.email)"> {{ getErrorMessage($v.email) }} </b-form-invalid-feedback>

                    <b-input-group class="grupo fadeIn third">
                        <b-input-group-prepend is-text class="grupo-prend">
                            <b-icon icon="key-fill" :variant="classIcon($v.password)"></b-icon>
                        </b-input-group-prepend>
                        
                        <b-form-input 
                            type="password"
                            id="password"
                            name="password"
                            :state="classInput($v.password)"
                            placeholder="Password"
                            v-model.trim="$v.password.$model" 
                        ></b-form-input>
                    </b-input-group>
                    
                    <b-form-invalid-feedback class="mensaje" :state="classInput($v.password)"> {{ getErrorMessage($v.password) }} </b-form-invalid-feedback>

                    <input type="submit" class="fadeIn fourth" value="Log In" /> 
                </b-form>
            </div>
        </div>
    </div>
</template>

<script>
    import authService from '../services/api/authService.js';
    import { required, minLength, maxLength, email } from 'vuelidate/lib/validators';

    export default {
        name: "DashboardLogin",
        data () {
            return {
                email: 'admin@admin.com',
                password: 'admin',
                error: false,
                error_msg: '',
                submit: false
            }  
        },

        validations: {
            email: { required, email },
            password: { required, minLength: minLength(5), maxLength: maxLength(20) }
        },

        watch: {
            email(newValue, oldValue) {
                this.submit = false;
                // this.error = false;
            },
            password(newValue, oldValue) {
                this.submit = false;
                // this.error = false;
            },
        },

        computed: {
            classInput: (app) => (field) => {
                if (app.submit) {
                    return (field.$error && field.$dirty ? false : !field.$error && field.$dirty ? true : null);    
                }else {
                    return (!field.$error && field.$dirty ? true : null);
                }
            },

            classIcon: () => (field) => {
                if (app.submit) {
                    return (field.$error && field.$dirty ? 'danger' : !field.$error && field.$dirty ? 'success' : null);
                }else {
                    return (!field.$error && field.$dirty ? 'success' : null);
                }
            },

            getErrorMessage: () => (field) => {
                /* VERIFICAR SI TIENE ERROR */
                if (!field.$error) {
                    return null
                }

                const messages = {
                    required: 'Campo requerido',
                    minLength: `El campo debe tener al menos ${field.$params.minLength ? field.$params.minLength.min: 0} caracteres`,
                    maxLength: `El campo debe tener como máximo ${field.$params.maxLength ? field.$params.maxLength.max: 0} caracteres`,
                    email: 'Debe ingresar un correo válido'                    
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
            async enviar() {
                try {
                    /* VERIFICAR LA VALIDES DEL FORMULARIO */
                    this.submit = true;

                    this.$v.$touch();
                    
                    if (this.$v.$invalid) {
                        this.error = true;
                        this.error_msg = 'Verifique los siguientes Errores.';
                        return;
                    }

                    let datos = {
                        email: this.email,
                        password: this.password
                    }

                    const res = await authService.post(datos);

                    if (res.data.error) {
                        this.error = true;
                        this.error_msg = res.data.message;
                    }else {
                        this.error = false;
                        this.error_msg = '';

                        localStorage.token = res.data.results[0].token;

                        this.$router.push('/employees');
                    }

                } catch (err) {
                    console.log(err);
                }
            }
        }
    };
</script>

<style scoped>
    /* BASIC */
    html {
        background-color: #56baed;
    }

    body {
        font-family: "Poppins", sans-serif;
        height: 100vh;
    }

    a {
        color: #92badd;
        display:inline-block;
        text-decoration: none;
        font-weight: 400;
    }

    h2 {
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        text-transform: uppercase;
        display:inline-block;
        margin: 40px 8px 10px 8px; 
        color: #cccccc;
    }

    /* STRUCTURE */
    .wrapper {
        display: flex;
        align-items: center;
        flex-direction: column; 
        justify-content: center;
        width: 100%;
        min-height: 100%;
        padding: 20px;
    }

    #formContent {
        -webkit-border-radius: 10px 10px 10px 10px;
        border-radius: 10px 10px 10px 10px;
        background: #fff;
        padding: 30px;
        width: 90%;
        max-width: 450px;
        position: relative;
        padding: 0px;
        -webkit-box-shadow: 0 30px 60px 0 rgba(0,0,0,0.3);
        box-shadow: 0 30px 60px 0 rgba(0,0,0,0.3);
        text-align: center;
    }

    #formFooter {
        background-color: #f6f6f6;
        border-top: 1px solid #dce8f1;
        padding: 25px;
        text-align: center;
        -webkit-border-radius: 0 0 10px 10px;
        border-radius: 0 0 10px 10px;
    }

    /* TABS */
    h2.inactive {
        color: #cccccc;
    }

    h2.active {
        color: #0d0d0d;
        border-bottom: 2px solid #5fbae9;
    }

    .grupo {        
        width: 90%;
        margin: 0px auto;        
    }

    .alert {        
        width: 90%;
        margin: 0px auto;        
        margin-bottom: 25px;
    }

    .grupo-prend {
        height: 38px;        
    }

    .mensaje {
        margin-bottom: 10px;
    }

    /* FORM TYPOGRAPHY*/
    input[type=button], input[type=submit], input[type=reset]  {
        background-color: #56baed;
        border: none;
        color: white;
        padding: 15px 80px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        text-transform: uppercase;
        font-size: 13px;
        -webkit-box-shadow: 0 10px 30px 0 rgba(95,186,233,0.4);
        box-shadow: 0 10px 30px 0 rgba(95,186,233,0.4);
        -webkit-border-radius: 5px 5px 5px 5px;
        border-radius: 5px 5px 5px 5px;
        margin: 5px 20px 40px 20px;
        -webkit-transition: all 0.3s ease-in-out;
        -moz-transition: all 0.3s ease-in-out;
        -ms-transition: all 0.3s ease-in-out;
        -o-transition: all 0.3s ease-in-out;
        transition: all 0.3s ease-in-out;
    }

    input[type=button]:hover, input[type=submit]:hover, input[type=reset]:hover  {
        background-color: #39ace7;
    }

    input[type=button]:active, input[type=submit]:active, input[type=reset]:active  {
        -moz-transform: scale(0.95);
        -webkit-transform: scale(0.95);
        -o-transform: scale(0.95);
        -ms-transform: scale(0.95);
        transform: scale(0.95);
    }
    
    input[type=text], input[type=password] {
        /* background-color: #f6f6f6;
        border: none; */
        color: #0d0d0d;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin-bottom: 10px;
        
        /* width: 85%; */
        -webkit-transition: all 0.5s ease-in-out;
        -moz-transition: all 0.5s ease-in-out;
        -ms-transition: all 0.5s ease-in-out;
        -o-transition: all 0.5s ease-in-out;
        transition: all 0.5s ease-in-out;
        -webkit-border-radius: 5px 5px 5px 5px;
        border-radius: 5px 5px 5px 5px;
    }

    /* input[type=text]:focus, input[type=password]:focus {
        background-color: #fff;
    }

    input[type=text]:placeholder, input[type=password]:placeholder {
        color: #cccccc;
    } */

    /* ANIMATIONS */
    /* Simple CSS3 Fade-in-down Animation */
    .fadeInDown {
        -webkit-animation-name: fadeInDown;
        animation-name: fadeInDown;
        -webkit-animation-duration: 1s;
        animation-duration: 1s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both;
    }

    @-webkit-keyframes fadeInDown {
        0% {
            opacity: 0;
            -webkit-transform: translate3d(0, -100%, 0);
            transform: translate3d(0, -100%, 0);
        }
        100% {
            opacity: 1;
            -webkit-transform: none;
            transform: none;
        }
    }

    @keyframes fadeInDown {
        0% {
            opacity: 0;
            -webkit-transform: translate3d(0, -100%, 0);
            transform: translate3d(0, -100%, 0);
        }
        100% {
            opacity: 1;
            -webkit-transform: none;
            transform: none;
        }
    }

    /* Simple CSS3 Fade-in Animation */
    @-webkit-keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @-moz-keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

    .fadeIn {
        opacity:0;
        -webkit-animation:fadeIn ease-in 1;
        -moz-animation:fadeIn ease-in 1;
        animation:fadeIn ease-in 1;

        -webkit-animation-fill-mode:forwards;
        -moz-animation-fill-mode:forwards;
        animation-fill-mode:forwards;

        -webkit-animation-duration:1s;
        -moz-animation-duration:1s;
        animation-duration:1s;
    }

    .fadeIn.first {
        -webkit-animation-delay: 0.4s;
        -moz-animation-delay: 0.4s;
        animation-delay: 0.4s;
    }

    .fadeIn.second {
        -webkit-animation-delay: 0.6s;
        -moz-animation-delay: 0.6s;
        animation-delay: 0.6s;
    }

    .fadeIn.third {
        -webkit-animation-delay: 0.8s;
        -moz-animation-delay: 0.8s;
        animation-delay: 0.8s;
    }

    .fadeIn.fourth {
        -webkit-animation-delay: 1s;
        -moz-animation-delay: 1s;
        animation-delay: 1s;
    }

    /* Simple CSS3 Fade-in Animation */
    .underlineHover:after {
        display: block;
        left: 0;
        bottom: -10px;
        width: 0;
        height: 2px;
        background-color: #56baed;
        content: "";
        transition: width 0.2s;
    }

    .underlineHover:hover {
        color: #0d0d0d;
    }

    .underlineHover:hover:after{
        width: 100%;
    }

    /* OTHERS */
    *:focus {
        outline: none;
    } 

    #icon {
        width:55%;
    }
</style>